import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue, Guid } from '@omnia/fx-models';
import { ProcessTemplateService, ProcessTypeService } from '../services';
import { ProcessType, ProcessTypeSettingsTypes, ProcessTypeItemSettings, ProcessTypeGroupSettings } from '../models';
import { TermStore } from '@omnia/fx-sp';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTypeStore extends Store {

    @Inject(ProcessTypeService) private processTypeService: ProcessTypeService;
    @Inject(TermStore) private termStore: TermStore;
    @Inject(MultilingualStore) private multilingualTextsStore: MultilingualStore;

    private ensuredChildrenPromises: { [rootId: string]: Promise<null> } = {};
    private ensuredProcessTypePromises: { [processTypeId: string]: Promise<null> } = {};
    private refreshCachePromises: { [trackingNumber: number]: Promise<null> } = {};
    private ensureRootProcessTypePromise: Promise<null> = null;

    private processTypeTermSetId: GuidValue = null;

    private processTypes = this.state<{ [rootId: string]: Array<ProcessType> }>({});
    private processTypesDict = this.state<{ [processTypeId: string]: ProcessType }>({});


    constructor() {
        super({
            id: "1f09d987-df87-4ede-971a-f7e95a18278d"
        });
    }

    getters = {
        children: (rootId: GuidValue, includeInvalid?: boolean): Array<ProcessType> => {
            let rootIdKey = this.getParentId(rootId);
            let children = this.processTypes.state[rootIdKey] || [];

            if (!includeInvalid) {
                children = children.filter(this.isValidProcessType);
            }

            return children;
        },
        byId: (id: GuidValue, includeInvalid?: boolean): ProcessType => {
            let idKey = id.toString().toLowerCase();
            let processType = this.processTypesDict.state[idKey];

            if (!includeInvalid && processType && !this.isValidProcessType(processType))
                return null;

            return processType;
        },
        rootProcessTypeInGlobalSettings: (): ProcessType => {
            let root: ProcessType = null;
            if (this.processTypeTermSetId && this.processTypeTermSetId != Guid.empty) {
                root = this.getters.byId(this.processTypeTermSetId);
            }

            return root;
        }
    }

    private isValidProcessType(processType: ProcessType) {
        let valid = processType.settings.type == ProcessTypeSettingsTypes.Group ||
            (processType.settings as ProcessTypeItemSettings).enterprisePropertySetId && (processType.settings as ProcessTypeItemSettings).enterprisePropertySetId != Guid.empty.toString();

        return valid;
    }

    private privateMutations = {
        addOrUpdateProcessTypes: this.mutation((processTypes: Array<ProcessType>, remove?: boolean) => {
            let groupByParent: { [rootId: string]: Array<ProcessType> } = {};
            let idsDictGroupByParent: { [rootId: string]: { [id: string]: boolean } } = {};

            this.processTypesDict.mutate(dictState => {
                processTypes.forEach(processType => {
                    if (processType.rootId) {
                        processType.multilingualTitle = this.multilingualTextsStore.getters.stringValue(processType.title);
                    }
                    else {
                        let termSet = this.termStore.getters.getTermSetById(processType.id);
                        if (termSet)
                            processType.multilingualTitle = termSet.name || termSet.id
                    }

                    let processTypeId = processType.id.toString().toLowerCase();
                    let rootId = this.getParentId(processType.rootId);
                    if (!groupByParent[rootId]) {
                        groupByParent[rootId] = [];
                        idsDictGroupByParent[rootId] = {};
                    }

                    if (!idsDictGroupByParent[rootId][processTypeId]) {
                        idsDictGroupByParent[rootId][processTypeId] = true;
                        groupByParent[rootId].push(processType);



                        dictState.state[processTypeId] = remove ? null : processType;
                        if (!this.ensuredProcessTypePromises[processTypeId])
                            this.ensuredProcessTypePromises[processTypeId] = Promise.resolve(null);
                    }
                })
            })

            let addedGroups: Array<ProcessType> = [];
            this.processTypes.mutate(state => {
                Object.keys(groupByParent).forEach(rootId => {
                    if (!state.state[rootId]) {
                        state.state[rootId] = [];
                    } else {
                        let idsDict = idsDictGroupByParent[rootId];
                        state.state[rootId] = state.state[rootId].filter(p => !idsDict[p.id.toString().toLowerCase()]);
                    }

                    if (!remove) {
                        let processTypes = groupByParent[rootId];
                        state.state[rootId] = state.state[rootId].concat(processTypes);

                        addedGroups = addedGroups.concat(processTypes.filter(t => t.settings.type == ProcessTypeSettingsTypes.Group));
                    }
                })
            });


            //Do not merge the sorting into the mutate actions above
            //do the sorting here to ensure all the parent process types is added into state first
            this.processTypes.mutate(state => {
                Object.keys(groupByParent).forEach(rootId => {
                    if (!this.isRootParentId(rootId)) {
                        let parent = this.processTypesDict.state[rootId];
                        if (parent && parent.settings && parent.settings.type == ProcessTypeSettingsTypes.Group) {
                            let groupSettings = (parent.settings as ProcessTypeGroupSettings);

                            let children = state.state[rootId];
                            children.sort((a, b) => this.sortByChildrenOrders(a, b, groupSettings.childrenOrders));
                        }
                    }
                });

                addedGroups.forEach(group => {
                    let children = state.state[group.id.toString()];
                    if (children && children.length > 1) {
                        let groupSettings = (group.settings as ProcessTypeGroupSettings);

                        children.sort((a, b) => this.sortByChildrenOrders(a, b, groupSettings.childrenOrders));
                    }
                })
            })
        })
    }

    private sortByChildrenOrders(a: ProcessType, b: ProcessType, childrenOrders: Array<GuidValue>) {
        let indexA = childrenOrders ? childrenOrders.indexOf(a.id) : -1;
        let indexB = childrenOrders ? childrenOrders.indexOf(b.id) : -1;


        if (indexA == -1 && indexB >= 0) return 1;
        if (indexB == -1 && indexA >= 0) return -1;


        let compare = indexA - indexB;
        if (compare == 0 && a.secondaryOrderNumber && b.secondaryOrderNumber) {
            compare = a.secondaryOrderNumber - b.secondaryOrderNumber
        }

        return compare;
    }

    private ensureChildren(rootId?: GuidValue) {
        var promiseKey = this.getParentId(rootId);
        if (!this.ensuredChildrenPromises[promiseKey]) {
            if (rootId) {
                this.ensuredChildrenPromises[promiseKey] = this.processTypeService.getChildren(rootId).then(processTypes => {
                    this.privateMutations.addOrUpdateProcessTypes.commit(processTypes);
                    return null;
                })
            } else {
                this.ensuredChildrenPromises[promiseKey] = Promise.all([
                    this.processTypeService.getChildren(rootId),
                    this.termStore.actions.ensureAllTermGroups.dispatch()
                ]).then((result) => {
                    this.privateMutations.addOrUpdateProcessTypes.commit(result[0]);
                    return null;
                })
            }
        }

        return this.ensuredChildrenPromises[promiseKey];
    }

    actions = {
        ensureRootProcessType: this.action(() => {
            if (!this.ensureRootProcessTypePromise) {
                this.ensureRootProcessTypePromise = new Promise<null>((resolve, reject) => {
                    this.processTypeService.getProcessTypeTermSetId().then((guidId) => {
                        if (guidId != Guid.empty) {
                            this.processTypeTermSetId = guidId;
                            this.ensureChildren().then(resolve).catch(reject);
                        }
                        else {
                            this.ensureRootProcessTypePromise = null;
                            let rootPromiseKey = this.getParentId();
                            this.ensuredChildrenPromises[rootPromiseKey] = null;
                            resolve(null);
                        }
                    }).catch(reject)
                })
            }

            return this.ensureRootProcessTypePromise;
        }),
        ensureChildren: this.action((rootId: GuidValue) => {
            return this.ensureChildren(rootId);
        }),
        createProcessType: this.action((processType: ProcessType) => {
            return this.processTypeService.create(processType).then(createdProcessType => {
                return this.processTypeService.getByIds([createdProcessType.rootId]).then(([parentProcessType]) => {
                    this.privateMutations.addOrUpdateProcessTypes.commit([createdProcessType, parentProcessType]);
                    return createdProcessType;
                })
            })
        }),
        updateProcessType: this.action((processType: ProcessType) => {
            return this.processTypeService.update(processType).then(updatedProcessType => {

                this.privateMutations.addOrUpdateProcessTypes.commit([updatedProcessType]);
                return updatedProcessType;
            })
        }),
        removeProcessType: this.action((processType: ProcessType) => {
            return this.processTypeService.remove(processType.id).then(() => {
                return this.processTypeService.getByIds([processType.rootId]).then(([parentProcessType]) => {
                    this.privateMutations.addOrUpdateProcessTypes.commit([processType], true);
                    this.privateMutations.addOrUpdateProcessTypes.commit([parentProcessType]);
                    return null;
                })
            })
        }),
        ensureProcessTypes: this.action((processTypeIds: Array<GuidValue>) => {
            let promises: Array<Promise<void>> = [];

            let processTypesNeedToLoad: Array<{ id: GuidValue, resolver: () => void, rejecter: (e) => void }> = [];
            processTypeIds.forEach(processTypeId => {
                let promiseKey = processTypeId.toString().toLowerCase();
                if (!this.ensuredProcessTypePromises[promiseKey]) {
                    this.ensuredProcessTypePromises[promiseKey] = new Promise((resolve, reject) => {
                        processTypesNeedToLoad.push({
                            id: processTypeId,
                            resolver: resolve,
                            rejecter: reject
                        });
                    })
                    promises.push(this.ensuredProcessTypePromises[promiseKey]);
                }
            })


            if (processTypesNeedToLoad.length > 0) {
                let ids = processTypesNeedToLoad.map(dt => dt.id);
                this.processTypeService.getByIds(ids).then(processTypes => {
                    this.privateMutations.addOrUpdateProcessTypes.commit(processTypes);
                    processTypesNeedToLoad.forEach(dt => dt.resolver())
                }).catch((e) => { processTypesNeedToLoad.forEach(dt => dt.rejecter(e)) })
            }
            return Promise.all(promises).then(() => { return null })
        }),
        refreshCache: this.action((trackingNumber: number) => {
            if (!this.refreshCachePromises[trackingNumber]) {
                this.refreshCachePromises[trackingNumber] = this.processTypeService.refreshServerCache().then(() => {
                    this.ensuredChildrenPromises = {};
                    this.ensuredProcessTypePromises = {};

                    return null;
                })
            }

            return this.refreshCachePromises[trackingNumber];
        })
    }

    private isRootParentId = (rootId: string) => rootId == '00000000-0000-0000-0000-000000000000';
    private getParentId = (rootId?: GuidValue) => rootId ? rootId.toString().toLowerCase() : '00000000-0000-0000-0000-000000000000';

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

