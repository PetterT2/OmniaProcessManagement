import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessTypeTermSynchronizationStatus, ProcessType, ProcessTypeGroupSettings } from '../../../../fx/models';
import { ProcessTypeStore } from '../../../../fx';
import { ProcessTypeTermSynchronizationTrackingService } from '../service';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTypeJourneyStore extends Store {
    @Inject(ProcessTypeStore) private processTypeStore: ProcessTypeStore;
    @Inject(ProcessTypeTermSynchronizationTrackingService) private processTypeTermSynchronizationTrackingService: ProcessTypeTermSynchronizationTrackingService;

    constructor() {
        super({
            id: "2f4249d0-b1cd-460a-98d5-cd0d94e604d9"
        });
    }

    private expands = this.state<{ [id: string]: boolean }>({});
    private selectingDocumentType = this.state<ProcessType>(null);
    private editingDocumentType = this.state<ProcessType>(null);
    private editingOriginalDocumentTypeTitle = this.state<string>('');
    private latestSyncStatus = this.state<ProcessTypeTermSynchronizationStatus>(null);

    getters = {
        selectingDocumentType: () => {
            return this.selectingDocumentType.state;
        },
        expandState: () => {
            return this.expands.state;
        },
        editingDocumentType: () => {
            return this.editingDocumentType.state;
        },
        editingOriginalDocumentTypeTitle: () => {
            return this.editingOriginalDocumentTypeTitle.state;
        },
        onEditingDocumentTypeMutated: () => {
            return this.editingDocumentType.onMutated
        },
        syncStatus: () => {
            return this.latestSyncStatus.state;
        },
        onSyncStatusMutated: () => {
            return this.latestSyncStatus.onMutated;
        }
    }

    syncStatusHandler = {
        startPullingSyncStatus: (termSetId: GuidValue) => {

            let getSyncStatusRejecter: { reject: () => void } = { reject: null };

            this.pullSyncStatus(termSetId, getSyncStatusRejecter);
            let intervalPullingSyncStatusRef = setInterval(() => {
                //We need to wrap a promise to be able to get the reject hanler
                this.pullSyncStatus(termSetId, getSyncStatusRejecter);
            }, 5000)

            return () => {
                clearInterval(intervalPullingSyncStatusRef);
                if (getSyncStatusRejecter && getSyncStatusRejecter.reject) {
                    getSyncStatusRejecter.reject();
                }
            };
        }
    }

    private pullSyncStatus = (termSetId: GuidValue, getSyncStatusRejecter: { reject: () => void }) => {
        (new Promise<ProcessTypeTermSynchronizationStatus>((resolve, reject) => {
            if (getSyncStatusRejecter.reject) getSyncStatusRejecter.reject();
            getSyncStatusRejecter.reject = reject;

            return this.processTypeTermSynchronizationTrackingService.getSyncStatus(termSetId)
                .then(resolve)
                .catch(err => {
                    console.error(err)
                })
        })).then(status => {
            if (status) {
                this.latestSyncStatus.mutate(status);
            }
        }).catch(() => {/*This is from our reject*/ })
    }

    mutations = {
        setSelectingDocumentType: this.mutation((processType: ProcessType) => {
            this.selectingDocumentType.mutate(processType);
            //if (processType && processType.parentId) {
            //    //ensure expands all parent
            //    let id = processType.parentId;
            //    let expands: { [id: string]: boolean } = {};
            //    while (id != null) {
            //        expands[id.toString()] = true;
            //        let parent = this.processTypeStore.getters.byId(id, true);
            //        id = parent ? parent.parentId : null;
            //    }

            //    this.mutations.setExpand.commit(expands);
            //}
        }),
        setEditingDocumentType: this.mutation((processType: ProcessType) => {
            this.editingDocumentType.mutate(processType);
            this.editingOriginalDocumentTypeTitle.mutate(processType ? processType.multilingualTitle : '');
        }),
        setExpand: this.mutation((val: { [id: string]: boolean }) => {
            this.expands.mutate(Object.assign({}, this.expands.state, val));
        }),
        resetExpand: this.mutation(() => {
            this.expands.mutate({})
        }),
        resetSyncStatus: this.mutation(() => {
            this.latestSyncStatus.mutate(null);
        })
    }

    actions = {
        addOrUpdate: this.action((processType: ProcessType) => {
            if (processType.id) {
                return this.processTypeStore.actions.updateProcessType.dispatch(processType).then((updatedDocumentType) => {

                    this.mutations.setEditingDocumentType.commit(null);
                    this.mutations.setSelectingDocumentType.commit(updatedDocumentType);

                    return null;
                })
            }
            else {
                return this.processTypeStore.actions.createProcessType.dispatch(processType).then((createdDocumentType) => {
                    this.mutations.setEditingDocumentType.commit(null);
                    this.mutations.setSelectingDocumentType.commit(createdDocumentType);

                    return null;
                })
            }
        }),
        remove: this.action((processType: ProcessType) => {
            return this.processTypeStore.actions.removeProcessType.dispatch(processType).then(() => {

                let root = this.processTypeStore.getters.byId(processType.rootId, true);
                this.mutations.setEditingDocumentType.commit(null);
                this.mutations.setSelectingDocumentType.commit(root);

                return null;
            })
        }),
        sort: this.action((processType: ProcessType, moveUp: boolean) => {
            var root = this.processTypeStore.getters.byId(processType.rootId, true);
            var children = this.processTypeStore.getters.children(root.id, true);
            var childrenIds = children.map(c => c.id);

            let currentChildIndex = childrenIds.indexOf(processType.id);
            let swapToChildIndex = currentChildIndex + (moveUp ? -1 : 1);
            let swapToChildId = childrenIds[swapToChildIndex];

            childrenIds[swapToChildIndex] = processType.id;
            childrenIds[currentChildIndex] = swapToChildId;

            (root.settings as ProcessTypeGroupSettings).childrenOrders = childrenIds;

            return this.processTypeStore.actions.updateProcessType.dispatch(root).then(() => {
                //to let the parent re-render
                let currentSelecting = this.getters.selectingDocumentType();
                this.mutations.setSelectingDocumentType.commit(currentSelecting);

                return null;
            });
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

