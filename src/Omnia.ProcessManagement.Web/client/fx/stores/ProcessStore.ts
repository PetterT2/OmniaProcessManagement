import { Store } from '@omnia/fx/store';
import { Injectable, Inject, ResolvablePromise } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessService } from '../services';
import { ProcessActionModel, ProcessStep, ProcessVersionType, Process, ProcessData, ProcessDataWithAuditing, ProcessReference, ProcessReferenceData } from '../models';
import { OPMUtils } from '../utils';


interface ProcessDict {
    [processId: string]: Process
}

interface ProcessDataDict {
    [processDataIdAndHash: string]: ProcessDataWithAuditing
}

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessStore extends Store {
    @Inject(ProcessService) private processService: ProcessService;

    //states
    private processDict = this.state<ProcessDict>({});
    private processDataDict = this.state<ProcessDataDict>({});


    //internal properties
    private processLoadPromises: { [processLoadPromiseKey: string]: ResolvablePromise<null> } = {};
    private processDataLoadPromises: { [processDataLoadPromiseKey: string]: ResolvablePromise<null> } = {};



    constructor() {
        super({
            id: "2ece393f-00a6-4e22-b380-ec3713d16d15"
        });
    }

    public getters = {
        getProcessReferenceData: (processReference: ProcessReference): ProcessReferenceData => {
            let processCacheKey = this.getProcessCacheKey(processReference.processId);
            let processDataCacheKey = this.getProcessDataCacheKey(processReference.processId, processReference.processStepId, processReference.processDataHash);
            let process = this.processDict.state[processCacheKey];
            let processData = this.processDataDict.state[processDataCacheKey];

            if (process == null)
                throw `Process with id: ${processReference.processId} not found in store`;

            if (processData == null)
                throw `Process with id: ${processReference.processId} does not contains valid process data for process step id: ${processReference.processStepId}`;

            let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processReference.processStepId);

            if (processData == null)
                throw `Process with id: ${processReference.processId} does not contains process step id: ${processReference.processStepId}`;


            let processReferenceData: ProcessReferenceData = {
                process: process,
                currentProcessStep: processStep,
                currentProcessData: processData,
                isRootProcessStep: process.rootProcessStep == processStep
            }

            return processReferenceData
        }
    }



    public actions = {
        createDraft: this.action((actionModel: ProcessActionModel) => {
            return this.processService.createDraftProcess(actionModel).then((process) => {

                return null;
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

                return null;
            })
        }),
        ensureProcessReferenceData: this.action((processReferences: Array<ProcessReference>) => {
            return new Promise<null>((resolve, reject) => {

                let ensurePromises: Array<Promise<null>> = [];

                for (let processReference of processReferences) {
                    let loadPromise = new Promise<null>((resolve, reject) => {
                        this.ensureProcess(processReference.processId).then((proces) => {
                            this.ensureProcessData(proces, processReference.processStepId).then((procesData) => {
                                resolve();
                            })
                        })
                    });

                    ensurePromises.push(loadPromise);
                }

                Promise.all(ensurePromises).then(() => {
                    resolve();
                }).catch(reject);

            });
        }),
        loadProcessByProcessStepId: this.action((processStepId: GuidValue, versionType: ProcessVersionType) => {
            return new Promise<Process>((resolve, reject) => {
                //TODO - apply loading promise handle ? or not

                this.processService.getProcessByProcessStepId(processStepId, versionType).then(process => {
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
        },
        addOrUpdateProcessData: (processId: GuidValue, processStep: ProcessStep, processData: ProcessDataWithAuditing, isRemove?: boolean) => {
            let currentState = this.processDataDict.state;
            let key = this.getProcessDataCacheKey(processId, processStep.id, processStep.processDataHash);
            let newState = Object.assign({}, currentState, { [key]: processData });

            this.processDataDict.mutate(newState);
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

    private ensureProcess = (processId: GuidValue): Promise<any> => {
        let resolvablePromise = this.getProcessLoadResolvablePromise(processId);

        if (!resolvablePromise.resolved && !resolvablePromise.rejected && !resolvablePromise.resolving) {
            resolvablePromise.resolving = true;

            this.processService.getProcess(processId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);
                resolvablePromise.resolve(process);
            });
        }

        return resolvablePromise.promise;
    }

    private ensureProcessData = (process: Process, processStepId: GuidValue): Promise<ProcessDataWithAuditing> => {
        let promise: Promise<ProcessDataWithAuditing> = null;

        let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStepId);

        if (processStep) {
            let resolvablePromise = this.getProcessDataLoadResolvablePromise(process.id, processStep.id, processStep.processDataHash);

            if (!resolvablePromise.resolved && !resolvablePromise.rejected && !resolvablePromise.resolving) {
                resolvablePromise.resolving = true;
                this.processService.getProcessData(processStep.id, processStep.processDataHash).then((processData) => {

                    this.internalMutations.addOrUpdateProcessData(process.id, processStep, processData);
                    resolvablePromise.resolve(null);
                });
            }

            return resolvablePromise.promise;
        } else {
            promise = Promise.reject('Process step not found');
        }

        return promise;
    }

    private getProcessLoadResolvablePromise = (processId: GuidValue): ResolvablePromise<any> => {

        let key = `${processId.toString()}`.toLowerCase();

        let existingPromise = this.processLoadPromises[key];

        if (!existingPromise) {
            this.processLoadPromises[key] = new ResolvablePromise<any>();
        } else if (existingPromise && existingPromise.rejected) {
            //We have an server failed-result already for this ref, we create a new promise to refresh from server
            this.processLoadPromises[key] = new ResolvablePromise<any>();
        }

        return this.processLoadPromises[key];
    }

    private getProcessDataLoadResolvablePromise = (processId: GuidValue, processStepId: GuidValue, hash: string): ResolvablePromise<null> => {
        let key = `${processId.toString()}-${processStepId.toString()}-${hash}`.toLowerCase();

        let existingPromise = this.processLoadPromises[key];

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

    private getProcessDataCacheKey = (processId: GuidValue, processStepId: GuidValue, processDataHash: string) => {
        return `${processId.toString()}-${processStepId.toString()}-${processDataHash}`.toLowerCase();
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

