﻿import { ProcessStep } from '../fx/models';
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

    export function navigateToNewState(path) {
        path = path ? path : '';
        var hash = window.location.hash.split("|")[0];
        if (hash.indexOf("?") > -1)
            hash = hash.split("?")[0];
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + hash + path;
        window.history.pushState({ path: newurl }, '', newurl);
    }
}