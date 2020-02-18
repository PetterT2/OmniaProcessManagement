import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject, ResolvablePromise } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessService } from '../services';
import { ProcessActionModel, ProcessStep, ProcessVersionType, Process, ProcessData, ProcessReference, ProcessReferenceData, ProcessCheckoutInfo, PreviewProcessWithCheckoutInfo, Version, OPMEnterprisePropertyInternalNames, InternalProcessStep, ProcessStepType } from '../models';
import { OPMUtils } from '../utils';
import { ProcessSite } from '../../models';


interface ProcessDict {
    [processId: string]: Process
}

interface ProcessSiteDict {
    [processStepId: string]: ProcessSite
}

interface ProcessDataDict {
    [processDataIdAndHash: string]: ProcessData
}

interface ProcessStepIdAndProcessIdDict {
    [processStepIdWithVersion: string]: string
}

interface ProcessCheckoutInfoDict {
    [opmProcessId: string]: ProcessCheckoutInfo;
}


@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessStore extends Store {
    @Inject(ProcessService) private processService: ProcessService;

    //states
    private processDict = this.state<ProcessDict>({});
    private processCheckoutInfoDict = this.state<ProcessCheckoutInfoDict>({});
    private processDataDict = this.state<ProcessDataDict>({});
    private processSiteDict = this.state<ProcessSiteDict>({});


    //internal properties
    private processLoadPromises: { [processLoadPromiseKey: string]: ResolvablePromise<null> } = {};
    private processDataLoadPromises: { [processDataLoadPromiseKey: string]: ResolvablePromise<null> } = {};
    private processSiteLoadPromises: { [processSiteLoadPromiseKey: string]: ResolvablePromise<null> } = {};

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

            let parentProcessData = null;
            if (processStepRef.parentProcessStep) {
                let parentProcessDataCacheKey = this.getProcessDataCacheKey(processReference.processId, processStepRef.parentProcessStep.id);
                parentProcessData = this.processDataDict.state[parentProcessDataCacheKey];
                if (parentProcessData == null)
                    throw `Process with id: ${processReference.processId} does not contains valid process data for process step id: ${processStepRef.parentProcessStep.id}`;
            }

            let processReferenceData: ProcessReferenceData = null;
            let processSite = this.processSiteDict.state[this.getProcessSiteCacheKey(process.rootProcessStep.id)]

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
                        parentProcessStep: processStepRef.parentProcessStep,
                        parentProcessData: parentProcessData
                    },
                    shortcut: {
                        processStep: shortcutProcessStepRef.desiredProcessStep,
                        processData: shortcutProcessData,
                        parentProcessStep: shortcutProcessStepRef.parentProcessStep
                    },
                    processSite: processSite
                }
            }
            else {
                processReferenceData = {
                    process: process,
                    current: {
                        processStep: processStepRef.desiredProcessStep,
                        processData: processData,
                        parentProcessStep: processStepRef.parentProcessStep,
                        parentProcessData: parentProcessData
                    },
                    processSite: processSite
                }
            }
            return processReferenceData
        },
        processCheckoutInfo: (opmProcessId: GuidValue) => {
            return this.processCheckoutInfoDict.state[opmProcessId.toString()];
        },
        process: (processId: GuidValue) => {
            return this.processDict.state[processId.toString()];
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
        ensureProcessCheckoutInfo: this.action((opmProcessId: GuidValue) => {
            return this.processService.getProcessCheckoutInfo(opmProcessId).then((info) => {
                this.internalMutations.addOrUpdateProcessCheckoutInfo(opmProcessId, info);
                return info;
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
                            var processStepData = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processReference.processStepId);

                            if (processStepData.parentProcessStep)
                                promises.push(this.ensureProcessData(process, processStepData.parentProcessStep.id));

                            if (processReference.shortcutProcessStepId) {
                                promises.push(this.ensureProcessData(process, processReference.shortcutProcessStepId));
                            }
                            promises.push(this.ensureProcessSite(process.teamAppId));
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
        loadProcessByProcessStepId: this.action((processStepId: GuidValue, version: Version) => {
            return new Promise<Process>((resolve, reject) => {
                let dictKey = `${processStepId.toString()}-${version.edition}-${version.revision}`.toLowerCase();
                let processId = this.processStepIdAndProcessIdDict[dictKey];
                if (processId) {
                    this.ensureProcess(processId).then(() => {
                        let processCacheKey = this.getProcessCacheKey(processId);
                        let process = this.processDict.state[processCacheKey];
                        if (process.versionType === ProcessVersionType.Published || process.versionType === ProcessVersionType.Archived) {
                            resolve(process);
                        }
                        else {
                            this.processService.getArchivedOrPublishedProcessByProcessStepId(processStepId, version).then(process => {
                                this.internalMutations.addOrUpdateProcess(process);
                                resolve(process);
                            }).catch(reject);
                        }
                    }).catch(reject)
                }
                else {
                    this.processService.getArchivedOrPublishedProcessByProcessStepId(processStepId, version).then(process => {
                        this.internalMutations.addOrUpdateProcess(process);
                        resolve(process);
                    }).catch(reject);
                }
            })
        }),
        loadPreviewProcessByProcessStepId: this.action((processStepId: GuidValue) => {
            return new Promise<PreviewProcessWithCheckoutInfo>((resolve, reject) => {
                this.processService.getPreviewProcessByProcessStepId(processStepId).then(previewProcessWithCheckoutInfo => {
                    this.internalMutations.addOrUpdateProcess(previewProcessWithCheckoutInfo.process);
                    this.internalMutations.addOrUpdateProcessCheckoutInfo(previewProcessWithCheckoutInfo.process.opmProcessId, previewProcessWithCheckoutInfo.checkoutInfo);
                    resolve(previewProcessWithCheckoutInfo);
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
                let edition = process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition];
                let revision = process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMRevision];
                let dictKey = `${stepId.toString()}-${edition}-${revision}`.toLowerCase();

                this.processStepIdAndProcessIdDict[dictKey] = process.id.toString().toLowerCase()
            }

            let resolvablePromise = this.getProcessLoadResolvablePromise(process.id);
            if (!resolvablePromise.resolved) {
                resolvablePromise.resolve(null);
            }
        },
        addOrUpdateProcessSite: (processSite: ProcessSite) => {
            let currentState = this.processSiteDict.state;
            let key = this.getProcessSiteCacheKey(processSite.id);
            let newState = Object.assign({}, currentState, { [key]: processSite });
            this.processSiteDict.mutate(newState);

            let resolvablePromise = this.getProcessSiteLoadResolvablePromise(processSite.id);
            if (!resolvablePromise.resolved) {
                resolvablePromise.resolve(null);
            }
        },
        addOrUpdateProcessCheckoutInfo: (opmProcessId: GuidValue, info: ProcessCheckoutInfo) => {
            let currentState = this.processCheckoutInfoDict.state;
            let key = this.getProcessCheckoutCacheKey(opmProcessId);
            let newState = Object.assign({}, currentState, { [key]: info });
            this.processCheckoutInfoDict.mutate(newState);
        },
        addOrUpdateProcessData: (processId: GuidValue, processStep: InternalProcessStep, processData: ProcessData) => {
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

    private ensureProcessSite = (teamAppId: GuidValue): Promise<null> => {
        let resolvablePromise = this.getProcessSiteLoadResolvablePromise(teamAppId);

        if (!resolvablePromise.resolved && !resolvablePromise.resolving) {
            resolvablePromise.resolving = true;

            this.processService.getProcessSiteByAppId(teamAppId).then((processSite) => {
                this.internalMutations.addOrUpdateProcessSite(processSite);
            }).catch((reason) => {
                resolvablePromise.reject(reason);
            });
        }

        return resolvablePromise.promise;
    }

    private ensureProcessData = (process: Process, processStepId: GuidValue): Promise<ProcessData> => {
        let promise: Promise<ProcessData> = null;

        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStepId);

        if (processStepRef.desiredProcessStep && processStepRef.desiredProcessStep.type == ProcessStepType.Internal) {
            let desiredProcessStep = processStepRef.desiredProcessStep as InternalProcessStep;
            let resolvablePromise = this.getProcessDataLoadResolvablePromise(process.id, desiredProcessStep.id, desiredProcessStep.processDataHash);

            if (!resolvablePromise.resolved && !resolvablePromise.resolving) {
                resolvablePromise.resolving = true;
                this.processService.getProcessData(desiredProcessStep.id, desiredProcessStep.processDataHash).then((processData) => {
                    this.internalMutations.addOrUpdateProcessData(process.id, desiredProcessStep, processData);
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

    private getProcessSiteLoadResolvablePromise = (teamAppId: GuidValue): ResolvablePromise<null> => {

        let key = `${teamAppId.toString()}`.toLowerCase();

        let existingPromise = this.processSiteLoadPromises[key];

        if (!existingPromise) {
            this.processSiteLoadPromises[key] = new ResolvablePromise<null>();
        } else if (existingPromise && existingPromise.rejected) {
            //We have an server failed-result already for this ref, we create a new promise to refresh from server
            this.processSiteLoadPromises[key] = new ResolvablePromise<null>();
        }

        return this.processSiteLoadPromises[key];
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

    private getProcessCheckoutCacheKey = (opmProcessId: GuidValue) => {
        return `${opmProcessId.toString()}`.toLowerCase();
    }

    private getProcessCacheKey = (processId: GuidValue) => {
        return `${processId.toString()}`.toLowerCase();
    }

    private getProcessSiteCacheKey = (teamAppId: GuidValue) => {
        return `${teamAppId.toString()}`.toLowerCase();
    }

    private getProcessDataCacheKey = (processId: GuidValue, processStepId: GuidValue) => {
        return `${processId.toString()}-${processStepId.toString()}`.toLowerCase();
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

