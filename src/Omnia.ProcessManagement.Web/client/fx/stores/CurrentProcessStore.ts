import { Store } from '@omnia/fx/store';
import { Injectable, Inject, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessStore } from './ProcessStore';
import { ProcessService } from '../services';
import { ProcessActionModel, ProcessData, ProcessReference, ProcessReferenceData, Process } from '../models';
import { OPMUtils } from '../utils';
import { setTimeout } from 'timers';

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
    @Inject(ProcessService) private processService: ProcessService;
    @Inject(OmniaContext) private omniaContext: OmniaContext;

    private currentProcessReference = this.state<ProcessReference>(null);
    private currentProcessReferenceData = this.state<ProcessReferenceData>(null);

    private currentProcessDataJson = '';

    private transaction: ProcessStateTransaction = new ProcessStateTransaction(
        () => this.currentProcessReferenceData.state || this.currentProcessReference.state ? true : false
    );

    constructor() {
        super({
            id: "0efe6f4f-1e0e-4d06-8eb7-a29ad124d8df"
        });
    }

    public getters = {
        referenceData: () => this.currentProcessReferenceData.state
    }

    public actions = {
        setProcessToShow: this.action((processReferenceToUse: ProcessReference) => {
            if (processReferenceToUse == null) {
                this.currentProcessDataJson = '';
                this.currentProcessReference.mutate(null);
                this.currentProcessReferenceData.mutate(null);
                this.transaction.clearState();
                return Promise.resolve(null);
            }

            return this.transaction.newState(processReferenceToUse.processId, (newState) => {

                return new Promise<null>((resolve, reject) => {
                    this.processStore.actions.ensureProcessReferenceData.dispatch([processReferenceToUse]).then(() => {
                        let processReferenceData = this.processStore.getters.getProcessReferenceData(processReferenceToUse);

                        this.currentProcessReference.mutate(processReferenceToUse);
                        this.currentProcessReferenceData.mutate(processReferenceData);

                        this.currentProcessDataJson = JSON.stringify(processReferenceData.currentProcessData)

                        resolve();
                    }).catch((reason) => {
                        reject(reason);
                    });
                })
            });
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
                return this.actions.setProcessToShow.dispatch(processReferenceToUse)
            })
        }),
        saveState: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<null>((resolve, reject) => {
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    let newProcessDataJson = JSON.stringify(currentProcessReferenceData.currentProcessData);
                    if (this.currentProcessDataJson != newProcessDataJson) {
                        let actionModel: ProcessActionModel = {
                            process: currentProcessReferenceData.process,
                            processData: { [this.currentProcessReferenceData.state.currentProcessStep.id.toString()]: this.currentProcessReferenceData.state.currentProcessData }
                        }

                        this.processService.saveCheckedOutProcess(actionModel).then(process => {
                            this.currentProcessDataJson = newProcessDataJson;

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
                return this.actions.setProcessToShow.dispatch(processReferenceToUse)
            })
        })
    }

    private prepareProcessReferenceToUse(process: Process, processStepId: GuidValue) {
        let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStepId);
        let processReferenceToUse: ProcessReference = null;

        if (processStep) {
            processReferenceToUse = { processId: process.id, processStepId: processStep.id, opmProcessId: process.opmProcessId }
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

