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
    private selectingProcessType = this.state<ProcessType>(null);
    private editingProcessType = this.state<ProcessType>(null);
    private editingOriginalProcessTypeTitle = this.state<string>('');
    private latestSyncStatus = this.state<ProcessTypeTermSynchronizationStatus>(null);

    getters = {
        selectingProcessType: () => {
            return this.selectingProcessType.state;
        },
        expandState: () => {
            return this.expands.state;
        },
        editingProcessType: () => {
            return this.editingProcessType.state;
        },
        editingOriginalProcessTypeTitle: () => {
            return this.editingOriginalProcessTypeTitle.state;
        },
        onEditingProcessTypeMutated: () => {
            return this.editingProcessType.onMutated
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
        setSelectingProcessType: this.mutation((processType: ProcessType) => {
            this.selectingProcessType.mutate(processType);
            if (processType && processType.parentId) {
                //ensure expands all parent
                let id = processType.parentId;
                let expands: { [id: string]: boolean } = {};
                while (id != null) {
                    expands[id.toString()] = true;
                    let parent = this.processTypeStore.getters.byId(id, true);
                    id = parent ? parent.parentId : null;
                }

                this.mutations.setExpand.commit(expands);
            }
        }),
        setEditingProcessType: this.mutation((processType: ProcessType) => {
            this.editingProcessType.mutate(processType);
            this.editingOriginalProcessTypeTitle.mutate(processType ? processType.multilingualTitle : '');
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
                return this.processTypeStore.actions.updateProcessType.dispatch(processType).then((updatedProcessType) => {

                    this.mutations.setEditingProcessType.commit(null);
                    this.mutations.setSelectingProcessType.commit(updatedProcessType);

                    return null;
                })
            }
            else {
                return this.processTypeStore.actions.createProcessType.dispatch(processType).then((createdProcessType) => {
                    this.mutations.setEditingProcessType.commit(null);
                    this.mutations.setSelectingProcessType.commit(createdProcessType);

                    return null;
                })
            }
        }),
        remove: this.action((processType: ProcessType) => {
            return this.processTypeStore.actions.removeProcessType.dispatch(processType).then(() => {

                let parent = this.processTypeStore.getters.byId(processType.parentId, true);
                this.mutations.setEditingProcessType.commit(null);
                this.mutations.setSelectingProcessType.commit(parent);

                return null;
            })
        }),
        sort: this.action((processType: ProcessType, moveUp: boolean) => {
            var parent = this.processTypeStore.getters.byId(processType.parentId, true);
            var children = this.processTypeStore.getters.children(parent.id, true);
            var childrenIds = children.map(c => c.id);

            let currentChildIndex = childrenIds.indexOf(processType.id);
            let swapToChildIndex = currentChildIndex + (moveUp ? -1 : 1);
            let swapToChildId = childrenIds[swapToChildIndex];

            childrenIds[swapToChildIndex] = processType.id;
            childrenIds[currentChildIndex] = swapToChildId;

            (parent.settings as ProcessTypeGroupSettings).childrenOrders = childrenIds;

            return this.processTypeStore.actions.updateProcessType.dispatch(parent).then(() => {
                //to let the parent re-render
                let currentSelecting = this.getters.selectingProcessType();
                this.mutations.setSelectingProcessType.commit(currentSelecting);

                return null;
            });
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

