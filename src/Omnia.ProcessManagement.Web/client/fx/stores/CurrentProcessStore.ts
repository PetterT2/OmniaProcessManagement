import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject, OmniaContext, Utils } from '@omnia/fx';
import { InstanceLifetimes, GuidValue, MultilingualString, Guid } from '@omnia/fx-models';
import { ProcessStore } from './ProcessStore';
import { ProcessActionModel, ProcessData, ProcessReference, ProcessReferenceData, Process, ProcessStep, IdDict, ProcessVersionType, InternalProcessStep, ProcessStepType, ExternalProcessStep, Version } from '../models';
import { OPMUtils } from '../utils';
import { InternalOPMTopics } from '../messaging/InternalOPMTopics';
import { OPMSpecialRouteVersion } from '../constants';

type EnsureActiveProcessInStoreFunc = () => boolean;

class ProcessStateTransaction {
    private currentProcessId: GuidValue = '';

    private pendingStateOperation: Promise<any> = null;

    private ensureActiveProcessInStore: EnsureActiveProcessInStoreFunc;
    constructor(ensureActiveProcessInStore: EnsureActiveProcessInStoreFunc) {
        this.ensureActiveProcessInStore = ensureActiveProcessInStore;
    }

    public clearState = () => {
        this.currentProcessId = '';
    }

    public newState = <T extends any>(processId: GuidValue, createNewStateOperation: (newState: boolean) => Promise<T>): Promise<T> => {
        let result: Promise<T> = null;
        if (processId != this.currentProcessId) {
            this.currentProcessId = processId;
            //Start a new chain for process

            if (this.pendingStateOperation !== null) {
                result = new Promise<T>((resolve, reject) => {

                    let hookUpNewProcess = () => {
                        createNewStateOperation(true).then(resolve).catch(reject);
                    }

                    //Wait for previous process pending operations
                    this.pendingStateOperation.then(hookUpNewProcess).catch(hookUpNewProcess);

                });
            } else {
                result = createNewStateOperation(true);
            }

            this.pendingStateOperation = result;
        } else {
            let hookUpNewProcessOperation = () => {
                return createNewStateOperation(false);
            }

            //Still on same process, await peanding operations, before executing
            result = this.newProcessOperation(hookUpNewProcessOperation);
        }

        return result;
    }

    public newProcessOperation = <T extends any>(operation: () => Promise<T>): Promise<T> => {

        let activeProcessExist = this.ensureActiveProcessInStore();
        if (!activeProcessExist)
            throw `Active Process not found in store to process operation`; //This could be something wrong in using process store. Should verify the way using the store if got this error message

        let requestedForTransactionId = this.currentProcessId;
        let result: Promise<T> = null;

        if (this.pendingStateOperation !== null) {

            result = new Promise<T>((resolve, reject) => {

                let runIfSameState = () => {
                    if (requestedForTransactionId === this.currentProcessId) {

                        let activeProcessExist = this.ensureActiveProcessInStore();
                        if (activeProcessExist) {
                            let operationPromise = operation();
                            this.pendingStateOperation = operationPromise;

                            operationPromise.then(resolve).catch(reject);
                        }
                        else {
                            reject`Active Process not found in store to process operation`; //This could be something wrong in using process store. Should verify the way using the store if got this error message
                        }

                    } else {
                        //We have had a change to a new state before the requested operation was ready to execute
                        let debug = "State has changed, we have a new state, all pending operations are invalid and will not be resolved/rejected";
                        console.warn(debug);
                        //or should we reject, reject may cause executes in caller
                    }
                }

                this.pendingStateOperation.then(() => {
                    //We run next operation
                    runIfSameState();
                }).catch((reason) => {
                    //We run next operation even if previous unrealated operation might have been rejected, we just act as we have been told, but wait for things to complete
                    runIfSameState();
                });
            });

        } else {
            result = operation();
            this.pendingStateOperation = result;
        }

        return result;
    }
}

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class CurrentProcessStore extends Store {
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    private currentProcessReference = this.state<ProcessReference>(null);
    private currentProcessReferenceData = this.state<ProcessReferenceData>(null);

    private relevantProcessStepIdAndProcessIdDict: IdDict<GuidValue> = {};
    private relevantProcessIdAndProcessStepIdDictDict: IdDict<IdDict<boolean>> = {};

    private currentLoadedProcessDataDict: IdDict<ProcessData> = {};

    private currentProcessJson = '';
    private currentLoadedProcessDataJsonDict: IdDict<string> = {};

    private transaction: ProcessStateTransaction = new ProcessStateTransaction(
        () => this.currentProcessReferenceData.state || this.currentProcessReference.state ? true : false
    );

    constructor() {
        super({
            id: "0efe6f4f-1e0e-4d06-8eb7-a29ad124d8df"
        });
    }

    public getters = {
        referenceData: () => this.currentProcessReferenceData.state,
        onCurrentProcessReferenceDataMutated: () => {
            return this.currentProcessReferenceData.onMutated
        },
        relevantProcess: (processStepId: GuidValue): { process: Process, processStepIdDict: IdDict<boolean> } => {
            let process = this.getRelevantProcess(processStepId);
            if (!process) {
                return null
            }
            return {
                process: process,
                processStepIdDict: this.relevantProcessIdAndProcessStepIdDictDict[process.id.toString().toLowerCase()]
            }
        }
    }

    mutations = {

    }

    public actions = {
        setProcessToShow: this.action((processReferenceToUse: ProcessReference): Promise<null> => {
            if (processReferenceToUse == null) {
                this.currentLoadedProcessDataJsonDict = {};
                this.currentLoadedProcessDataDict = {};
                this.currentProcessJson = '';

                this.relevantProcessIdAndProcessStepIdDictDict = {};
                this.relevantProcessStepIdAndProcessIdDict = {};

                this.currentProcessReference.mutate(null);
                this.currentProcessReferenceData.mutate(null);
                this.transaction.clearState();
                return Promise.resolve(null);
            }

            return this.transaction.newState(processReferenceToUse.processId, (newState) => {
                if (newState) {
                    this.currentLoadedProcessDataJsonDict = {};
                    this.currentLoadedProcessDataDict = {};
                    this.currentProcessJson = '';
                }

                return new Promise<null>((resolve, reject) => {
                    this.processStore.actions.ensureProcessReferenceData.dispatch([processReferenceToUse]).then(() => {
                        let processReferenceData = this.processStore.getters.getProcessReferenceData(processReferenceToUse);

                        this.currentProcessReference.mutate(processReferenceToUse);
                        this.currentProcessReferenceData.mutate(processReferenceData);

                        this.currentLoadedProcessDataDict[processReferenceData.current.processStep.id.toString().toLowerCase()] = processReferenceData.current.processData;

                        this.currentProcessJson = JSON.stringify(processReferenceData.process);
                        this.currentLoadedProcessDataJsonDict[processReferenceData.current.processStep.id.toString().toLowerCase()] = JSON.stringify(processReferenceData.current.processData);

                        if (processReferenceData.shortcut) {
                            this.currentLoadedProcessDataDict[processReferenceData.shortcut.processStep.id.toString().toLowerCase()] = processReferenceData.shortcut.processData;
                            this.currentLoadedProcessDataJsonDict[processReferenceData.shortcut.processStep.id.toString().toLowerCase()] = JSON.stringify(processReferenceData.shortcut.processData);
                        }

                        resolve();
                    }).catch((reason) => {
                        reject(reason);
                    });
                })
            });
        }),
        ensureShortcut: this.action((shortcutProcessStepId: GuidValue): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<ProcessReference>((resolve, reject) => {
                    if (this.currentProcessReference.state) {
                        let currentProcessReference: ProcessReference = {
                            opmProcessId: this.currentProcessReference.state.opmProcessId,
                            processId: this.currentProcessReference.state.processId,
                            processStepId: this.currentProcessReference.state.processStepId,
                            shortcutProcessStepId: shortcutProcessStepId
                        }
                        resolve(currentProcessReference);
                    }
                    else {
                        reject('Active Process not found in store to process operation');
                    }
                })
            }).then((processReferenceToUse) => {
                return this.actions.setProcessToShow.dispatch(processReferenceToUse)
            })
        }),
        ensureRelavantProcess: this.action((processStepId: GuidValue, version: Version) => {
            let loadProcessPromise: Promise<Process> = null;
            let isPreview = OPMSpecialRouteVersion.isPreview(version);

            if (isPreview) {
                if (this.relevantProcessStepIdAndProcessIdDict[processStepId.toString().toLowerCase()]) {
                    let process = this.getRelevantProcess(processStepId);
                    loadProcessPromise = Promise.resolve(process);
                }
                else {
                    loadProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(processStepId).then(p => {
                        this.updateProcessStepIdAndProcessIdDict(p.process);
                        return p.process;
                    })
                }
            }
            else {
                loadProcessPromise = this.processStore.actions.loadProcessByProcessStepId.dispatch(processStepId, version).then(p => {
                    this.updateProcessStepIdAndProcessIdDict(p);
                    return p;
                })
            }

            return loadProcessPromise;
        }),
        checkOut: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<ProcessReference>((resolve, reject) => {
                    let currentProcessReference = this.currentProcessReference.state;
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    this.processStore.actions.checkoutProcess.dispatch(currentProcessReferenceData.process.opmProcessId).then((process) => {
                        let processReferenceToUse = this.prepareProcessReferenceToUse(process, currentProcessReference.processStepId);
                        resolve(processReferenceToUse);
                    }).catch(reject);
                })
            }).then((processReferenceToUse) => {
                return this.actions.setProcessToShow.dispatch(processReferenceToUse)
            })
        }),
        checkIn: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<ProcessReference>((resolve, reject) => {

                    let currentProcessReference = this.currentProcessReference.state;
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    this.processStore.actions.checkInProcess.dispatch(currentProcessReferenceData.process.opmProcessId).then((process) => {
                        let processReferenceToUse = this.prepareProcessReferenceToUse(process, currentProcessReference.processStepId);
                        resolve(processReferenceToUse);
                    }).catch(reject);
                })
            }).then((processReferenceToUse) => {
                InternalOPMTopics.onProcessChanged.publish(ProcessVersionType.Draft);
                return this.actions.setProcessToShow.dispatch(processReferenceToUse);
            })
        }),
        deleteProcessStep: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<null>((resolve, reject) => {
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    currentProcessReferenceData.current.parentProcessStep.processSteps.splice(
                        currentProcessReferenceData.current.parentProcessStep.processSteps.indexOf(currentProcessReferenceData.current.processStep), 1)

                    let actionModel: ProcessActionModel = {
                        process: currentProcessReferenceData.process,
                        processData: {}
                    }

                    this.processStore.actions.saveCheckedOutProcess.dispatch(actionModel).then((process) => {
                        resolve(null)
                    }).catch(reject)
                })
            })
        }),
        addProcessStep: this.action((title: MultilingualString): Promise<{ process: Process, processStep: InternalProcessStep }> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<{ process: Process, processStep: InternalProcessStep }>((resolve, reject) => {
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;
                    if (currentProcessReferenceData.current.processStep.type !== ProcessStepType.Internal) {
                        throw `Only internal process step can add child process step`
                    }

                    if (Utils.isNullOrEmpty(title))
                        title = { isMultilingualString: true };
                    let processStep: InternalProcessStep = {
                        id: Guid.newGuid(),
                        title: title,
                        processDataHash: '',
                        processSteps: [],
                        multilingualTitle: this.multilingualStore.getters.stringValue(title),
                        type: ProcessStepType.Internal
                    };

                    let processData: ProcessData = {
                        content: { isMultilingualString: true },
                        canvasDefinition: null,
                        documents: null,
                        links: null,
                        tasks: null
                    } as ProcessData



                    if (!(currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps) {
                        (currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps = [];
                    }

                    (currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps.push(processStep);


                    let actionModel: ProcessActionModel = {
                        processStepTitle: title,
                        process: currentProcessReferenceData.process,
                        processData: { [processStep.id.toString()]: processData }
                    }

                    this.processStore.actions.saveCheckedOutProcess.dispatch(actionModel).then((process) => {
                        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStep.id);
                        resolve({
                            process: process,
                            processStep: processStepRef.desiredProcessStep as InternalProcessStep
                        });
                    }).catch(reject)
                })
            })
        }),
        addExtenalProcessStep: this.action((title: MultilingualString, externalRootProcessStepId: GuidValue): Promise<{ process: Process, processStep: ExternalProcessStep }> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<{ process: Process, processStep: ExternalProcessStep }>((resolve, reject) => {
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;
                    if (currentProcessReferenceData.current.processStep.type !== ProcessStepType.Internal) {
                        throw `Only internal process step can add child process step`
                    }

                    if (Utils.isNullOrEmpty(title))
                        title = { isMultilingualString: true };
                    let processStep: ExternalProcessStep = {
                        id: Guid.newGuid(),
                        title: title,
                        multilingualTitle: this.multilingualStore.getters.stringValue(title),
                        rootProcessStepId: externalRootProcessStepId,
                        type: ProcessStepType.External
                    };



                    if (!(currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps) {
                        (currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps = [];
                    }

                    (currentProcessReferenceData.current.processStep as InternalProcessStep).processSteps.push(processStep);


                    let actionModel: ProcessActionModel = {
                        processStepTitle: title,
                        process: currentProcessReferenceData.process,
                        processData: {}
                    }

                    this.processStore.actions.saveCheckedOutProcess.dispatch(actionModel).then((process) => {
                        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStep.id);
                        resolve({
                            process: process,
                            processStep: processStepRef.desiredProcessStep as ExternalProcessStep
                        });
                    }).catch(reject)
                })
            })
        }),
        //refreshContentNavigation parameter is used for onDispatched
        saveState: this.action((refreshContentNavigation?: boolean): Promise<null> => {

            return this.transaction.newProcessOperation(() => {
                return new Promise<null>((resolve, reject) => {
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;
                    let currentProcess = currentProcessReferenceData.process;
                    let hasShortcut = currentProcessReferenceData.shortcut ? true : false;

                    let currentProcessStepId = currentProcessReferenceData.current.processStep.id.toString().toLowerCase();
                    let shortcutProcessStepId = hasShortcut ? currentProcessReferenceData.shortcut.processStep.id.toString() : '';

                    let currentProcessStepData = currentProcessReferenceData.current.processData
                    let shortcutProcessStepData = hasShortcut ? currentProcessReferenceData.shortcut.processData : null;

                    let currentProcessJson = JSON.stringify(currentProcessReferenceData.process);
                    let currentProcessStepDataJson = JSON.stringify(currentProcessStepData);

                    let shortcutProcessDataJson = '';
                    if (shortcutProcessStepData) {
                        shortcutProcessDataJson = JSON.stringify(shortcutProcessStepData);
                    }

                    let processChanged = currentProcessJson != this.currentProcessJson;
                    let currentProcessStepDataChanged = currentProcessStepDataJson != this.currentLoadedProcessDataJsonDict[currentProcessStepId];
                    let shortcutProcessStepDataChanged = hasShortcut && shortcutProcessDataJson != this.currentLoadedProcessDataJsonDict[shortcutProcessStepId];

                    if (processChanged || currentProcessStepDataChanged || shortcutProcessStepDataChanged) {
                        let actionModel: ProcessActionModel = {
                            processStepTitle: currentProcessReferenceData.current.processStep.title,
                            process: currentProcess,
                            processData: {}
                        }

                        if (currentProcessStepDataChanged) {
                            actionModel.processData[currentProcessStepId] = currentProcessStepData;
                        }

                        if (shortcutProcessStepDataChanged) {
                            actionModel.processData[shortcutProcessStepId] = shortcutProcessStepData
                        }

                        this.processStore.actions.saveCheckedOutProcess.dispatch(actionModel).then(() => {
                            this.currentProcessJson = currentProcessJson;
                            this.currentLoadedProcessDataJsonDict[currentProcessStepId] = currentProcessStepDataJson;
                            if (hasShortcut) {
                                this.currentLoadedProcessDataJsonDict[shortcutProcessStepId] = shortcutProcessDataJson;
                            }

                            resolve(null);

                        }).catch(reject);
                    }
                    else {
                        resolve(null);
                    }
                })
            })
        }),
        discardChange: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<ProcessReference>((resolve, reject) => {
                    let currentProcessReference = this.currentProcessReference.state;
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    this.processStore.actions.discardChangeProcess.dispatch(currentProcessReferenceData.process.opmProcessId).then((process) => {
                        let processReferenceToUse = this.prepareProcessReferenceToUse(process, currentProcessReference.processStepId);
                        resolve(processReferenceToUse);
                    }).catch(reject);
                })
            }).then((processReferenceToUse) => {
                return this.actions.setProcessToShow.dispatch(processReferenceToUse);
            })
        })
    }

    private getRelevantProcess(processStepId: GuidValue): Process {
        let process: Process = null;
        if (this.relevantProcessStepIdAndProcessIdDict[processStepId.toString().toLowerCase()]) {
            let previewProcessId = this.relevantProcessStepIdAndProcessIdDict[processStepId.toString().toLowerCase()];
            process = this.processStore.getters.process(previewProcessId);
        }
        return process;
    }

    private updateProcessStepIdAndProcessIdDict(process: Process) {
        let processId = process.id.toString().toLowerCase();
        let stepIds = OPMUtils.getAllProcessStepIds(process.rootProcessStep);
        let stepIdDict: IdDict<boolean> = {};
        stepIds.forEach(id => {
            id = id.toString().toLowerCase();
            this.relevantProcessStepIdAndProcessIdDict[id] = processId;
            stepIdDict[id] = true;
        });
        this.relevantProcessIdAndProcessStepIdDictDict[processId] = stepIdDict;
    }

    private prepareProcessReferenceToUse(process: Process, processStepId: GuidValue) {
        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStepId);
        let processReferenceToUse: ProcessReference = null;

        if (processStepRef.desiredProcessStep) {
            processReferenceToUse = { processId: process.id, processStepId: processStepId, opmProcessId: process.opmProcessId }
        }
        //If selecting process step is not found after checking out process. it means the client-side data is old/out-of-date. We fallback to the root process step
        else {
            processReferenceToUse = { processId: process.id, processStepId: process.rootProcessStep.id, opmProcessId: process.opmProcessId }
        }

        return processReferenceToUse;
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

