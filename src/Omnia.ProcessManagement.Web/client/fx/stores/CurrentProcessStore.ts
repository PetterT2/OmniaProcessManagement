import { Store } from '@omnia/fx/store';
import { Injectable, Inject, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessStore } from './ProcessStore';
import { ProcessReference, ProcessReferenceData } from '../../models';
import { ProcessService } from '../services';
import { OPMUtils } from '../../core';

type EnsureActiveProcessInStoreFunc = () => boolean;

class ProcessStateTransaction {
    private currentOPMProcessId: GuidValue = '';
    private pendingStateOperation: Promise<any> = null;
    private ensureActiveProcessInStore: EnsureActiveProcessInStoreFunc;
    constructor(ensureActiveProcessInStore: EnsureActiveProcessInStoreFunc) {
        this.ensureActiveProcessInStore = ensureActiveProcessInStore;
    }

    public newState = <T extends any>(opmProcessId: GuidValue, createNewStateOperation: () => Promise<T>): Promise<T> => {
        let result: Promise<T> = null;
        if (opmProcessId != this.currentOPMProcessId) {
            this.currentOPMProcessId = opmProcessId;
            //Start a new chain for process

            if (this.pendingStateOperation !== null) {
                result = new Promise<T>((resolve, reject) => {

                    let hookUpNewProcess = () => {
                        createNewStateOperation().then(resolve).catch(reject);
                    }

                    //Wait for previous process pending operations
                    this.pendingStateOperation.then(hookUpNewProcess).catch(hookUpNewProcess);

                });
            } else {
                result = createNewStateOperation();
            }

            this.pendingStateOperation = result;
        } else {
            //Still on same process, await peanding operations, before executing
            result = this.newProcessOperation(createNewStateOperation);
        }

        return result;
    }

    public newProcessOperation = <T extends any>(operation: () => Promise<T>): Promise<T> => {

        let activeProcessExist = this.ensureActiveProcessInStore();
        if (!activeProcessExist)
            throw `Active Process not found in store to process operation`; //This could be something wrong in using process store. Should verify the way using the store if got this error message

        let requestedForTransactionId = this.currentOPMProcessId;
        let result: Promise<T> = null;

        if (this.pendingStateOperation !== null) {

            result = new Promise<T>((resolve, reject) => {

                let runIfSameState = () => {
                    if (requestedForTransactionId === this.currentOPMProcessId) {

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
    @Inject(ProcessStore) processStore: ProcessStore;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(OmniaContext) omniaContext: OmniaContext;

    private currentProcessReference = this.state<ProcessReference>(null);
    private currentProcessReferenceData = this.state<ProcessReferenceData>(null);

    private transaction: ProcessStateTransaction = new ProcessStateTransaction(
        () => this.currentProcessReferenceData.state || this.currentProcessReference.state ? true : false
    );

    constructor() {
        super({
            id: "0efe6f4f-1e0e-4d06-8eb7-a29ad124d8df"
        });
    }

    public getters = {

    }

    public actions = {
        setProcessToShow: this.action((processReferenceToUse: ProcessReference) => {
            return this.transaction.newState(processReferenceToUse.opmProcessId, () => {
                return new Promise<null>((resolve, reject) => {
                    this.processStore.actions.ensureProcessReferenceData.dispatch([processReferenceToUse]).then(() => {
                        let processReferenceData = this.processStore.getters.getProcessReferenceData(processReferenceToUse);

                        this.currentProcessReference.mutate(processReferenceToUse);
                        this.currentProcessReferenceData.mutate(processReferenceData);

                        resolve();
                    }).catch((reason) => {
                        reject(reason);
                    });
                })
            });
        }),
        checkOutProcess: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<null>((resolve, reject) => {

                    let currentProcessReference = this.currentProcessReference.state;
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    this.processStore.actions.checkoutProcess.dispatch(currentProcessReferenceData.process.opmProcessId).then((process) => {
                        let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, currentProcessReference.processStepId);
                        let processReferenceToUse: ProcessReference = null;

                        if (processStep) {
                            processReferenceToUse = { processId: process.id, processStepId: processStep.id, processDataHash: processStep.processDataHash, opmProcessId: process.opmProcessId }
                        }
                        //If selecting process step is not found after checking out process. it means the client-side data is old/out-of-date. We fallback to the root process step
                        else {
                            processReferenceToUse = { processId: process.id, processStepId: process.rootProcessStep.id, processDataHash: process.rootProcessStep.processDataHash, opmProcessId: process.opmProcessId }
                        }

                        this.actions.setProcessToShow.dispatch(processReferenceToUse).then(resolve).catch(reject)

                    }).catch(reject);
                })
            })
        }),
        saveCheckedOutProcess: this.action((): Promise<null> => {
            return this.transaction.newProcessOperation(() => {
                return new Promise<null>((resolve, reject) => {

                    let currentProcessReference = this.currentProcessReference.state;
                    let currentProcessReferenceData = this.currentProcessReferenceData.state;

                    
                })
            })
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

