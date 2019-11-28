import { Inject, Injectable, ServiceContainer } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData } from '../models';
import { ProcessStore, CurrentProcessStore } from '../stores';
import { OPMUtils } from '..';
import { MultilingualStore } from '@omnia/fx/store';


@Injectable({ lifetime: InstanceLifetimes.Singelton })
class InternalOPMRouter extends TokenBasedRouter<OPMRoute, OPMRouteStateData>{
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    private currentProcessStepId: GuidValue = '';

    constructor() {
        super('pm')
    }

    /**
    * Implement abstract function
    */
    protected buildContextPath(routeContext: OPMRoute): string {
        let contextPath = '';

        if (routeContext && routeContext.processStepId) {
            contextPath = routeContext.processStepId.toString().toLowerCase();
        }

        return contextPath;
    }

    /**
    * Implement abstract function
    */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let context: OPMRoute = null;

        if (path) {
            context = {
                processStepId: new Guid(path)
            }
        }

        return context;
    }

    /**
    * Override protected function logic
    */
    protected protectedNavigate(title: string, context: OPMRoute, stateData: OPMRouteStateData = null, pushState: boolean = true) {
        super.protectedNavigate(title, context, stateData, pushState);
    }

    /**
    * Override protected function logic
    */
    protected protectedClearRoute() {
        super.protectedClearRoute();
    }

    public navigate(process: Process, processStep: ProcessStep): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let title = this.multilingualStore.getters.stringValue(processStep.title);
            this.protectedNavigate(title, { processStepId: processStep.id }, { versionType: process.versionType });

            let processRefrerence = OPMUtils.generateProcessReference(process, processStep.id);
            this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {

                resolve();
            }).catch(reject);
        })
    }

    public navigateWithCurrentRoute(processVersionType: ProcessVersionType) {
        let newProcessStepId = this.routeContext.route && this.routeContext.route.processStepId || '';
        if (newProcessStepId != this.currentProcessStepId) {
            this.currentProcessStepId = newProcessStepId;

            if (newProcessStepId) {
                this.processStore.actions.loadProcessByProcessStepId.dispatch(newProcessStepId, processVersionType).then((process) => {

                    //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                    //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                    let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                    this.navigate(process, processStep);
                }).catch((errMsg) => {
                    console.warn(`Cannot find valid ${processVersionType}-version process for the process step with id: ${newProcessStepId}`, errMsg);
                })
            }
            else {

            }
        }
    }
}

export const OPMRouter: InternalOPMRouter = ServiceContainer.createInstance(InternalOPMRouter);

OPMRouter.onNavigate.subscribe(ctx => {
    if (ctx.stateData) {
        OPMRouter.navigateWithCurrentRoute(ctx.stateData.versionType);
    }
})

if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
    OPMRouter.navigateWithCurrentRoute(ProcessVersionType.Published);
}
