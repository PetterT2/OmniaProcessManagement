import { Store } from '@omnia/fx/store';
import { Injectable, Inject, ResolvablePromise } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessService } from '../services';
import { ProcessActionModel, ProcessStep, ProcessVersionType, Process, ProcessData, ProcessDataWithAuditing } from '../models';
import { ProcessReference, ProcessReferenceData } from '../../models';
import { OPMUtils } from '../../core';


@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessStore extends Store {
    @Inject(ProcessService) private processService: ProcessService;

    //states
    private processDict = this.state<{ [processId: string]: Process }>({});
    private processDataDict = this.state<{ [processDataIdAndHash: string]: ProcessDataWithAuditing }>({});


    //internal properties
    private processLoadPromises: { [processLoadPromiseKey: string]: ResolvablePromise<null> } = {};
    private processDataLoadPromises: { [processDataLoadPromiseKey: string]: ResolvablePromise<null> } = {};



    constructor() {
        super({
            id: "2ece393f-00a6-4e22-b380-ec3713d16d15"
        });
    }

    public getters = {
        getProcessReferenceData: (processReference: ProcessReference) => {
            let processCacheKey = this.getProcessCacheKey(processReference.processId);
            let processDataCacheKey = this.getProcessDataCacheKey(processReference.processStepId, processReference.processDataHash);
            let process = this.processDict[processCacheKey];
            let processData = this.processDataDict[processDataCacheKey];

            if (process == null)
                throw `Process with id: ${processReference.processId} not found in store`;

            if (processData == null)
                throw `Process with id: ${processReference.processId} does not contains valid process data for process step id: ${processReference.processStepId}`;

            let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processReference.processStepId);

            if (processData == null)
                throw `Process with id: ${processReference.processId} does not contains process step id: ${processReference.processStepId}`;


            let processReferenceData = {
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
        checkInProcess: this.action((actionModel: ProcessActionModel) => {
            return this.processService.checkinProcess(actionModel).then((process) => {
                return null;
            })
        }),
        discardChangeProcess: this.action((opmProcessId: GuidValue) => {
            return this.processService.discardChangeProcess(opmProcessId).then((process) => {
                return null;
            })
        }),
        saveCheckedOutProcess: this.action((actionModel: ProcessActionModel) => {
            return this.processService.saveCheckedOutProcess(actionModel).then((process) => {
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

                            })
                        })
                    });

                    ensurePromises.push(loadPromise);
                }

                Promise.all(ensurePromises).then(() => {
                    resolve();
                }).catch(reject);

            });
        })
    }

    private internalMutations = {
        addOrUpdateProcess: (process: Process) => {
            let currentState = this.processDict.state;
            let key = this.getProcessCacheKey(process);
            let newState = Object.assign({}, currentState, { [key]: process });

            this.processDict.mutate(newState);
        },
        addOrUpdateProcessData: (processStep: ProcessStep, processData: ProcessDataWithAuditing) => {
            let currentState = this.processDataDict.state;
            let key = this.getProcessDataCacheKey(processStep.id, processStep.processDataHash);
            let newState = Object.assign({}, currentState, { [key]: processData });

            this.processDataDict.mutate(newState);
        }
    }

    private ensureProcess = (processId: GuidValue): Promise<null> => {
        let resolvablePromise = this.getProcessLoadResolvablePromise(processId);

        if (!resolvablePromise.resolved && !resolvablePromise.rejected && !resolvablePromise.resolving) {
            resolvablePromise.resolving = true;

            this.processService.getProcess(processId).then((process) => {
                this.internalMutations.addOrUpdateProcess(process);
                resolvablePromise.resolve(null);
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

                    this.internalMutations.addOrUpdateProcessData(processStep, processData);
                    resolvablePromise.resolve(null);
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
        let promise: ResolvablePromise<null> = null;

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

    private getProcessDataCacheKey = (processStepId: GuidValue, processDataHash: string) => {
        return `${processStepId.toString()}-${processDataHash}`.toLowerCase();
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

