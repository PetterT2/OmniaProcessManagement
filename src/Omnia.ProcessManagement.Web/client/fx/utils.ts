import { ProcessStep, Process, ProcessReference, RootProcessStep, Version, ProcessVersionType, OPMEnterprisePropertyInternalNames, ShapeTemplateType, ShapeTemplate, InternalProcessStep, ProcessStepType, IdDict } from '../fx/models';
import { GuidValue } from '@omnia/fx-models';
import { Utils, ResolvablePromise } from '@omnia/fx';
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
        if (processStep.type == ProcessStepType.Internal && (processStep as InternalProcessStep).processSteps) {
            for (let childProcessStep of (processStep as InternalProcessStep).processSteps) {
                generateProcessStepExpandStateInternal(childProcessStep, activeProcessStepId, expandState);

                if (expandState[childProcessStep.id.toString().toLowerCase()]) {
                    expandState[processStep.id.toString().toLowerCase()] = true;
                    break;
                }
            }
        }
    }

    export function getProcessStepInProcess(processStep: RootProcessStep, desiredProcessStepId: GuidValue): { desiredProcessStep: ProcessStep, parentProcessSteps: Array<InternalProcessStep> } {
        return getProcessStepInProcessInternal(processStep, desiredProcessStepId.toString().toLowerCase(), []);
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

    function getProcessStepInProcessInternal(processStep: ProcessStep, desiredProcessStepId: string, parentProcessSteps: Array<InternalProcessStep>): { desiredProcessStep: ProcessStep, parentProcessSteps: Array<InternalProcessStep> } {
        let desiredProcessStep: ProcessStep = null;
        if (processStep.id.toString().toLowerCase() == desiredProcessStepId) {
            desiredProcessStep = processStep;
        }
        else if (processStep.type == ProcessStepType.Internal && (processStep as InternalProcessStep).processSteps) {
            for (let childProcessStep of (processStep as InternalProcessStep).processSteps) {
                let result = getProcessStepInProcessInternal(childProcessStep, desiredProcessStepId, [...parentProcessSteps, processStep as InternalProcessStep]);
                if (result.desiredProcessStep) {
                    desiredProcessStep = result.desiredProcessStep;
                    parentProcessSteps = result.parentProcessSteps;
                    break;
                }
            }
        }

        return {
            desiredProcessStep: desiredProcessStep,
            parentProcessSteps: parentProcessSteps
        }
    }

    export function getAllProcessStepIds(processStep: ProcessStep) {
        let ids: Array<string> = [];

        ids.push(processStep.id.toString().toLowerCase());
        if (processStep.type == ProcessStepType.Internal && (processStep as InternalProcessStep).processSteps) {
            for (let childProcessStep of (processStep as InternalProcessStep).processSteps) {
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

    export function createProcessNavigationUrl(process: Process, desiredProcessStep: ProcessStep, previewPageUrl: string, omniaApp: boolean) {
        let url = "";

        let version = "";
        let hash = omniaApp ? '' : '#';
        let processStepId = desiredProcessStep.id.toString().toLowerCase();

        if (process.versionType == ProcessVersionType.Draft || process.versionType == ProcessVersionType.CheckedOut) {
            version = "/v-preview";
        } else if (process.versionType == ProcessVersionType.Archived) {
            let edition = process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition];
            let revision = process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMRevision];
            version = `/v-${edition}-${revision}`
        }

        if (previewPageUrl) {
            url = previewPageUrl + `/@pm/${processStepId}${version}`;
        }
        else {
            url = location.protocol + '//' + location.host + location.pathname + `${hash}/@pm/${processStepId}${version}/g`;
        }

        return url;
    }

    var existingWaitForElementAvailableDict: IdDict<ResolvablePromise<void>> = {};

    export function waitForElementAvailable(el: Element, elementId: string, callBack: () => void) {
        let msToReject = 5000; //5s for wait
        let msToCheck = 200; //200ms for each check
        let numberOfTimes = msToReject / msToCheck;
        let resolvablePromise = new ResolvablePromise<void>();

        if (existingWaitForElementAvailableDict[elementId] &&
            !existingWaitForElementAvailableDict[elementId].resolved &&
            !existingWaitForElementAvailableDict[elementId].rejected) {
            existingWaitForElementAvailableDict[elementId].reject('A existing waitForElementAvailable is obsoleted since a new one is comming');
        }

        existingWaitForElementAvailableDict[elementId] = resolvablePromise;

        let intervalHandler = setInterval(() => {
            let componentStillAlive = document.body.contains(el);
            let canvasAvailable = false;

            //If this component is not destroyed yet
            if (componentStillAlive) {
                canvasAvailable = document.getElementById(elementId) && true;
            }

            if (numberOfTimes == 1) {
                clearInterval(intervalHandler);
                resolvablePromise.reject(`5s timeout reached for waiting an element with id ${elementId}`);
            }
            else if (!componentStillAlive) {
                clearInterval(intervalHandler);

                resolvablePromise.reject(`The current component has been destroyed while its waiting for an element with id ${elementId}`);
            }
            else if (canvasAvailable) {
                clearInterval(intervalHandler);

                resolvablePromise.resolve();
            }

            numberOfTimes--;
        })

        resolvablePromise.promise.then(callBack).catch(err => console.warn(err));
    }
}

