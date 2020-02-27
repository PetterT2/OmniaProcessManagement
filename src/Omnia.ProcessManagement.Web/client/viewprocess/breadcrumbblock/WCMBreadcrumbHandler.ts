import { ServiceContainer } from "@omnia/fx";
import { CurrentProcessStore, OPMRouter, OPMUtils } from '../../fx';
import { BreadcrumbExtendedNode } from '@omnia/wcm/models';
import { BreadcrumbStore } from '@omnia/wcm';
import { GuidValue } from '@omnia/fx-models';

const currentProcessStore: CurrentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
const breadcrumbStore: BreadcrumbStore = ServiceContainer.createInstance(BreadcrumbStore);


const addNodes = (processStepId: GuidValue, nodes: Array<BreadcrumbExtendedNode>) => {
    let relevantProcess = currentProcessStore.getters.relevantProcess(processStepId);
    if (relevantProcess) {
        let { desiredProcessStep, parentProcessSteps } = OPMUtils.getProcessStepInProcess(relevantProcess.process.rootProcessStep, processStepId);
        if (desiredProcessStep) {
            for (let parentProcessStep of parentProcessSteps) {
                nodes.push({
                    title: parentProcessStep.multilingualTitle,
                    href: 'javascript:void(0)',
                    openHrefInNewWindow: false,
                    callBack: () => { OPMRouter.navigate(relevantProcess.process, parentProcessStep) }
                })
            }
            nodes.push({
                title: desiredProcessStep.multilingualTitle,
                href: 'javascript:void(0)',
                openHrefInNewWindow: false,
                callBack: () => { OPMRouter.navigate(relevantProcess.process, desiredProcessStep) }
            })
        }
    }
}

const updateWcmBreadcrumbExtendedNodes = () => {
    let nodes: Array<BreadcrumbExtendedNode> = [];
    let referenceData = currentProcessStore.getters.referenceData();

    if (referenceData && OPMRouter.routeContext && OPMRouter.routeContext.route) {
        if (OPMRouter.routeContext.route.externalParents) {
            for (let parent of OPMRouter.routeContext.route.externalParents) {
                addNodes(parent.processStepId, nodes);
            }
        }
        addNodes(OPMRouter.routeContext.route.processStepId, nodes);
    }
    breadcrumbStore.mutations.updateExtendedNodes.commit(nodes);
}

updateWcmBreadcrumbExtendedNodes();
currentProcessStore.getters.onCurrentProcessReferenceDataMutated()(() => {
    updateWcmBreadcrumbExtendedNodes();
})