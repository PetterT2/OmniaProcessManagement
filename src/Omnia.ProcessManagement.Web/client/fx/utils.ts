import { ProcessStep, Process, ProcessReference, RootProcessStep } from '../fx/models';
import { GuidValue } from '@omnia/fx-models';

export module OPMUtils {
    export function getProcessStepInProcess(processStep: RootProcessStep, processStepId: GuidValue): { desiredProcessStep: ProcessStep, parentProcessStep?: ProcessStep } {
        return getProcessStepInProcessInternal(processStep, processStepId, null);
    }

    export function generateProcessReference(process: Process, processStepId: GuidValue): ProcessReference {
        let processReference: ProcessReference = null;
        let processStepRef = getProcessStepInProcess(process.rootProcessStep, processStepId);
        if (processStepRef.desiredProcessStep) {
            processReference = {
                opmProcessId: process.opmProcessId,
                processId: process.id,
                processStepId: processStepId
            }
        }
        return processReference;
    }

    function getProcessStepInProcessInternal(processStep: ProcessStep, processStepId: GuidValue, parentProcessStep?: ProcessStep): { desiredProcessStep: ProcessStep, parentProcessStep?: ProcessStep } {
        let desiredProcessStep: ProcessStep = null;
        if (processStep.id.toString().toLowerCase() == processStepId.toString().toLowerCase()) {
            desiredProcessStep = processStep;
        }
        else if (processStep.processSteps) {
            for (let childProcessStep of processStep.processSteps) {
                let result = getProcessStepInProcessInternal(childProcessStep, processStepId, processStep);
                if (result.desiredProcessStep) {
                    desiredProcessStep = result.desiredProcessStep;
                    parentProcessStep = result.parentProcessStep;
                    break;
                }
            }
        }
        return {
            desiredProcessStep: desiredProcessStep,
            parentProcessStep: parentProcessStep
        }
    }


    export function navigateToNewState(path) {
        path = path ? path : '';
        var hash = window.location.hash.split("|")[0];
        if (hash.indexOf("?") > -1)
            hash = hash.split("?")[0];
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + path + hash;
        window.history.pushState({ path: newurl }, '', newurl);
    }
}
