﻿import { ProcessStep, Process, ProcessReference, RootProcessStep } from '../fx/models';
import { GuidValue } from '@omnia/fx-models';
import { Utils } from '@omnia/fx';
declare var moment: any;

export module OPMUtils {
    export function generateProcessStepExpandState(processStep: RootProcessStep, processStepId: GuidValue): { [processStepId: string]: true } {
        let expandState: { [id: string]: true } = {}
        generateProcessStepExpandStateInternal(processStep, processStepId.toString().toLowerCase(), expandState);
        return expandState;
    }

    function generateProcessStepExpandStateInternal(processStep: ProcessStep, activeProcessStepId: string, expandState: { [processStepId: string]: true }) {
        if (processStep.id.toString().toLowerCase() == activeProcessStepId) {
            expandState[processStep.id.toString().toLowerCase()] = true;
        }
        else if (processStep.processSteps) {
            for (let childProcessStep of processStep.processSteps) {
                generateProcessStepExpandStateInternal(childProcessStep, activeProcessStepId, expandState);

                if (expandState[childProcessStep.id.toString().toLowerCase()]) {
                    expandState[processStep.id.toString().toLowerCase()] = true;
                    break;
                }
            }
        }
    }

    export function getProcessStepInProcess(processStep: RootProcessStep, desiredProcessStepId: GuidValue): { desiredProcessStep: ProcessStep, parentProcessStep?: ProcessStep } {
        return getProcessStepInProcessInternal(processStep, desiredProcessStepId.toString().toLowerCase(), null);
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

    function getProcessStepInProcessInternal(processStep: ProcessStep, desiredProcessStepId: string, parentProcessStep?: ProcessStep): { desiredProcessStep: ProcessStep, parentProcessStep?: ProcessStep } {
        let desiredProcessStep: ProcessStep = null;
        if (processStep.id.toString().toLowerCase() == desiredProcessStepId) {
            desiredProcessStep = processStep;
        }
        else if (processStep.processSteps) {
            for (let childProcessStep of processStep.processSteps) {
                let result = getProcessStepInProcessInternal(childProcessStep, desiredProcessStepId, processStep);
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

    export function getAllProcessStepIds(processStep: ProcessStep) {
        let ids: Array<string> = [];

        ids.push(processStep.id.toString().toLowerCase());

        if (processStep.processSteps) {
            for (let childProcessStep of processStep.processSteps) {
                let childIds = getAllProcessStepIds(childProcessStep);
                ids = ids.concat(childIds);
            }
        }

        return ids;
    }

    export function navigateToNewState(path) {
        path = path ? path : '';
        var hash = window.location.hash.split("|")[0];
        if (hash.indexOf("?") > -1)
            hash = hash.split("?")[0];
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + path + hash;
        window.history.pushState({ path: newurl }, '', newurl);
    }

    export function correctDateOnlyValue(dateValue) {
        var offset = new Date().getTimezoneOffset();
        var correctDateValue: any = moment(dateValue).add('m', -offset);
        return correctDateValue._d;
    }

    export function getUserPrincipleName(loginName: string) {
        if (Utils.isNullOrEmpty(loginName))
            return "";
        let arr = loginName.split('|');
        return arr.length > 1 ? arr[arr.length - 1] : loginName;
    }
}
