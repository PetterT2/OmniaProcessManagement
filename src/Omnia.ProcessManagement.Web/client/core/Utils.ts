import { ProcessStep } from '../fx/models';
import { GuidValue } from '@omnia/fx-models';

export module OPMUtils {
    export function getProcessStepInProcess(processStep: ProcessStep, processStepId: GuidValue): ProcessStep {
        let desiredProcessStep: ProcessStep = null;
        if (processStep.id == processStepId) {
            desiredProcessStep = processStep;
        }
        else {
            for (let childProcessStep of processStep.processSteps) {
                desiredProcessStep = getProcessStepInProcess(childProcessStep, processStepId);
                if (desiredProcessStep) {
                    break;
                }
            }
        }
        return desiredProcessStep;
    }
}