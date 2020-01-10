import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject, ResolvablePromise } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessService } from '../services';
import { ProcessActionModel, ProcessStep, ProcessVersionType, Process, ProcessData, ProcessReference, ProcessReferenceData } from '../models';
import { OPMUtils } from '../utils';


interface ProcessDict {
    [processId: string]: Process
}

interface ProcessDataDict {
    [processDataIdAndHash: string]: ProcessData
}

interface ProcessStepIdAndProcessIdDict {
    [processStepId: string]: string
}


@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessStore extends Store {
    @Inject(ProcessService) private processService: ProcessService;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    //states
    private processDict = this.state<ProcessDict>({});
    private processDataDict = this.state<ProcessDataDict>({});


    //internal properties
    private processLoadPromises: { [processLoadPromiseKey: string]: ResolvablePromise<null> } = {};
    private processDataLoadPromises: { [processDataLoadPromiseKey: string]: ResolvablePromise<null> } = {};

    private processStepIdAndProcessIdDict: ProcessStepIdAndProcessIdDict = {};

    constructor() {
        super({
            id: "2ece393f-00a6-4e22-b380-ec3713d16d15"
        });
    }

    public getters = {
        getProcessReferenceData: (processReference: ProcessReference): ProcessReferenceData => {
            let processCacheKey = this.getProcessCacheKey(processReference.processId);
            let processDataCacheKey = this.getProcessDataCacheKey(processReference.processId, processReference.processStepId);
            let process = this.processDict.state[processCacheKey];
            let processData = this.processDataDict.state[processDataCacheKey];
            if (process == null)
                throw `Process with id: ${processReference.processId} not found in store`;

            if (processData == null)
                throw `Process with id: ${processReference.processId} does not contains valid process data for process step id: ${processReference.processStepId}`;

            let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processReference.processStepId);

            if (processStepRef.desiredProcessStep == null)
                throw `Process with id: ${processReference.processId} does not contains process step id: ${processReference.processStepId}`;


            let processReferenceData: ProcessReferenceData = null;

            if (processReference.shortcutProcessStepId) {
                let shortcutProcessDataCacheKey = this.getProcessDataCacheKey(processReference.processId, processReference.shortcutProcessStepId);
                let shortcutProcessData = this.processDataDict.state[shortcutProcessDataCacheKey];

                if (shortcutProcessData == null)
                    throw `Process with id: ${processReference.processId} does not contains valid process data for process step id: ${processReference.shortcutProcessStepId}`;

                let shortcutProcessStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processReference.shortcutProcessStepId);

                if (shortcutProcessStepRef.desiredProcessStep == null)
                    throw `Process with id: ${processReference.processId} does not contains process step id: ${processReference.shortcutProcessStepId}`;

                processReferenceData = {
                    process: process,
                    current: {
                        processStep: processStepRef.desiredProcessStep,
                        processData: processData,
                        parentProcessStep: processStepRef.parentProcessStep
                    },
                    shortcut: {
                        processStep: shortcutProcessStepRef.desiredProcessStep,
                        processData: shortcutProcessData,
                        parentProcessStep: shortcutProcessStepRef.parentProcessStep
                    }
                }
            }
            else {
                processReferenceData = {
                    process: process,
                    current: {
                        processStep: processStepRef.desiredProcessStep,
                        processData: processData,
                        parentProcessStep: processStepRef.parentProcessStep
                    }
                }
            }
            return processReferenceData
        }
    }



    public actions = {
        createDraft: this.action((actionModel: ProcessActionModel) => {
            return this.processService.createDraftProcess(actionModel).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        createDraftFromPublished: this.action((opmProcessId: GuidValue) => {
            return this.processService.createDraftProcessFromPublished(opmProcessId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        checkoutProcess: this.action((opmProcessId: GuidValue) => {
            return this.processService.checkoutProcess(opmProcessId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        checkInProcess: this.action((opmProcessId: GuidValue) => {
            return this.processService.checkinProcess(opmProcessId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        discardChangeProcess: this.action((opmProcessId: GuidValue) => {
            return this.processService.discardChangeProcess(opmProcessId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        saveCheckedOutProcess: this.action((actionModel: ProcessActionModel) => {
            return this.processService.saveCheckedOutProcess(actionModel).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

                return process;
            })
        }),
        ensureProcessReferenceData: this.action((processReferences: Array<ProcessReference>) => {
            return new Promise<null>((resolve, reject) => {

                let ensurePromises: Array<Promise<null>> = [];

                for (let processReference of processReferences) {
                    let loadPromise = new Promise<null>((resolve, reject) => {
                        this.ensureProcess(processReference.processId).then(() => {
                            let processCacheKey = this.getProcessCacheKey(processReference.processId);
                            let process = this.processDict.state[processCacheKey];

                            let promises: Array<Promise<ProcessData>> = [];

                            promises.push(this.ensureProcessData(process, processReference.processStepId));

                            if (processReference.shortcutProcessStepId) {
                                promises.push(this.ensureProcessData(process, processReference.shortcutProcessStepId));
                            }

                            Promise.all(promises).then(() => { resolve() }).catch(reject);
                        })
                    });

                    ensurePromises.push(loadPromise);
                }

                Promise.all(ensurePromises).then(() => {
                    resolve();
                }).catch(reject);

            });
        }),
        loadPublishedProcessByProcessStepId: this.action((processStepId: GuidValue) => {
            return new Promise<Process>((resolve, reject) => {

                let processId = this.processStepIdAndProcessIdDict[processStepId.toString().toLowerCase()];
                if (processId) {
                    this.ensureProcess(processId).then(() => {
                        let processCacheKey = this.getProcessCacheKey(processId);
                        let process = this.processDict.state[processCacheKey];
                        if (process.versionType === ProcessVersionType.Published) {
                            resolve(process);
                        }
                        else {
                            this.processService.getPublishedProcessByProcessStepId(processStepId).then(process => {
                                this.internalMutations.addOrUpdateProcess(process);
                                resolve(process);
                            }).catch(reject);
                        }
                    }).catch(reject)
                }
                else {
                    this.processService.getPublishedProcessByProcessStepId(processStepId).then(process => {
                        this.internalMutations.addOrUpdateProcess(process);
                        resolve(process);
                    }).catch(reject);
                }
            })
        }),
        loadPreviewProcessByProcessStepId: this.action((processStepId: GuidValue) => {
            return new Promise<Process>((resolve, reject) => {
                this.processService.getPreviewProcessByProcessStepId(processStepId).then(process => {
                    this.internalMutations.addOrUpdateProcess(process);
                    resolve(process);
                }).catch(reject);
            })
        }),
        deleteDraftProcess: this.action((process: Process) => {
            return new Promise<null>((resolve, reject) => {
                this.processService.deleteDraftProcess(process.opmProcessId).then(() => {
                    this.internalMutations.removeProcess(process);
                    resolve(null);
                }).catch(reject);
            })
        })
    }

    private internalMutations = {
        addOrUpdateProcess: (process: Process) => {
            let currentState = this.processDict.state;
            let key = this.getProcessCacheKey(process.id);
            let newState = Object.assign({}, currentState, { [key]: process });
            this.processDict.mutate(newState);

            let stepIds = OPMUtils.getAllProcessStepIds(process.rootProcessStep);
            for (let stepId of stepIds) {
                this.processStepIdAndProcessIdDict[stepId.toString().toLowerCase()] = process.id.toString().toLowerCase()
            }

            let resolvablePromise = this.getProcessLoadResolvablePromise(process.id);
            if (!resolvablePromise.resolved) {
                resolvablePromise.resolve(null);
            }
        },
        addOrUpdateProcessData: (processId: GuidValue, processStep: ProcessStep, processData: ProcessData) => {
            let currentState = this.processDataDict.state;
            let newKey = this.getProcessDataCacheKey(processId, processStep.id);
            let newState = Object.assign({}, currentState, { [newKey]: processData });

            this.processDataDict.mutate(newState);

            let resolvablePromise = this.getProcessDataLoadResolvablePromise(processId, processStep.id, processStep.processDataHash);
            if (!resolvablePromise.resolved) {
                resolvablePromise.resolve(null);
            }
        },
        removeProcess: (process: Process) => {
            let processCurrentState = this.processDict.state;
            let key = this.getProcessCacheKey(process.id);
            let newState = Object.assign({}, processCurrentState, { [key]: null });
            this.processDict.mutate(newState);

            let processId = process.id.toString().toLowerCase();
            let processDataCurrentState = this.processDataDict.state;
            let processDataNewState: ProcessDataDict = {};
            Object.keys(processDataCurrentState).forEach(key => {
                if (!key.startsWith(processId)) {
                    processDataNewState[key] = processDataCurrentState[key]
                }
            })

            this.processDataDict.mutate(processDataNewState);
        }
    }

    private ensureProcess = (processId: GuidValue): Promise<null> => {
        let resolvablePromise = this.getProcessLoadResolvablePromise(processId);

        if (!resolvablePromise.resolved && !resolvablePromise.resolving) {
            resolvablePromise.resolving = true;

            this.processService.getProcess(processId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);

            }).catch((reason) => {
                resolvablePromise.reject(reason);
            });
        }

        return resolvablePromise.promise;
    }

    private ensureProcessData = (process: Process, processStepId: GuidValue): Promise<ProcessData> => {
        let promise: Promise<ProcessData> = null;

        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStepId);

        if (processStepRef.desiredProcessStep) {
            let resolvablePromise = this.getProcessDataLoadResolvablePromise(process.id, processStepRef.desiredProcessStep.id, processStepRef.desiredProcessStep.processDataHash);

            if (!resolvablePromise.resolved && !resolvablePromise.resolving) {
                resolvablePromise.resolving = true;
                this.processService.getProcessData(processStepRef.desiredProcessStep.id, processStepRef.desiredProcessStep.processDataHash, process.versionType).then((processData) => {
                    this.internalMutations.addOrUpdateProcessData(process.id, processStepRef.desiredProcessStep, processData);
                }).catch((reason) => {
                    resolvablePromise.reject(reason);
                });
            }

            return resolvablePromise.promise;
        } else {
            promise = Promise.reject('Process step not found');
        }

        return promise;
    }

    private getProcessLoadResolvablePromise = (processId: GuidValue): ResolvablePromise<null> => {

        let key = `${processId.toString()}`.toLowerCase();

        let existingPromise = this.processLoadPromises[key];

        if (!existingPromise) {
            this.processLoadPromises[key] = new ResolvablePromise<null>();
        } else if (existingPromise && existingPromise.rejected) {
            //We have an server failed-result already for this ref, we create a new promise to refresh from server
            this.processLoadPromises[key] = new ResolvablePromise<null>();
        }

        return this.processLoadPromises[key];
    }

    private getProcessDataLoadResolvablePromise = (processId: GuidValue, processStepId: GuidValue, hash: string): ResolvablePromise<null> => {
        let key = `${processId.toString()}-${processStepId.toString()}-${hash}`.toLowerCase();

        let existingPromise = this.processDataLoadPromises[key];

        if (!existingPromise) {
            this.processDataLoadPromises[key] = new ResolvablePromise<null>();
        } else if (existingPromise && existingPromise.rejected) {
            //We have an server failed-result already for this ref, we create a new promise to refresh from server
            this.processDataLoadPromises[key] = new ResolvablePromise<null>();
        }

        return this.processDataLoadPromises[key];
    }

    private getProcessCacheKey = (processId: GuidValue) => {
        return `${processId.toString()}`.toLowerCase();
    }

    private getProcessDataCacheKey = (processId: GuidValue, processStepId: GuidValue) => {
        return `${processId.toString()}-${processStepId.toString()}`.toLowerCase();
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

