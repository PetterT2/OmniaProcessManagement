import { Inject, Injectable, ServiceContainer } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData, ViewOptions } from '../models';
import { ProcessStore, CurrentProcessStore } from '../stores';
import { OPMUtils } from '../utils';
import { MultilingualStore } from '@omnia/fx/store';


@Injectable({ lifetime: InstanceLifetimes.Singelton })
class InternalOPMRouter extends TokenBasedRouter<OPMRoute, OPMRouteStateData>{
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

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

            contextPath = routeContext.viewOption.toString() + '/' + contextPath;
        }
        return contextPath;
    }

    /**
    * Implement abstract function
    */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let context: OPMRoute = null;
        let viewOption: ViewOptions = ViewOptions.viewLatestPublishedInBlock;
        path = path.toLowerCase();

        if (path.startsWith(ViewOptions.previewDraft)) {
            path = path.substr(`${ViewOptions.previewDraft}/`.length);
            viewOption = ViewOptions.previewDraft;
        }
        if (path.startsWith(ViewOptions.viewLatestPublishedInGlobal)) {
            path = path.substr(`${ViewOptions.viewLatestPublishedInGlobal}/`.length);
            viewOption = ViewOptions.viewLatestPublishedInGlobal;
        }
        if (path) {
            context = {
                processStepId: new Guid(path),
                viewOption: viewOption
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

    public navigate(process: Process, processStep: ProcessStep, viewOption?: ViewOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (viewOption === undefined || viewOption === null) {
                viewOption = this.routeContext.route && this.routeContext.route.viewOption || ViewOptions.viewLatestPublishedInBlock;
            }

            let title = this.multilingualStore.getters.stringValue(processStep.title);

            this.protectedNavigate(title, { viewOption: viewOption, processStepId: processStep.id }, { versionType: process.versionType });

            let processRefrerence = OPMUtils.generateProcessReference(process, processStep.id);
            if (processRefrerence) {
                this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {
                    console.log('set process to show');
                    resolve();
                }).catch(reject);
            }
            else {
                reject(`Cannot find valid ${process.versionType}-version process for the process step with id: ${processStep.id}`)
            }
        })
    }

    public clearRoute() {
        this.currentProcessStore.actions.setProcessToShow.dispatch(null).then(() => {
            this.protectedClearRoute();
        })
    }

    public navigateWithCurrentRoute(processVersionType: ProcessVersionType): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let newProcessStepId = this.routeContext.route && this.routeContext.route.processStepId || '';

            if (newProcessStepId) {
                this.processStore.actions.loadProcessByProcessStepId.dispatch(newProcessStepId, processVersionType).then((process) => {

                    //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                    //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                    let processStep = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                    this.navigate(process, processStep).then(resolve).catch(reject);
                }).catch((errMsg) => {

                    console.warn(`Cannot find valid ${processVersionType}-version process for the process step with id: ${newProcessStepId}`, errMsg);
                    reject();
                })
            }
            else {
                reject(`Cannot find valid process match to current route`);
            }
        })
    }
}

export const OPMRouter: InternalOPMRouter = ServiceContainer.createInstance(InternalOPMRouter);

OPMRouter.onNavigate.subscribe(ctx => {
    if (ctx.route && ctx.stateData) {
        OPMRouter.navigateWithCurrentRoute(ctx.stateData.versionType);
    }
    else {
        OPMRouter.clearRoute();
    }
})

if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
    let versionType = OPMRouter.routeContext.route.viewOption == ViewOptions.previewDraft ? ProcessVersionType.Draft : ProcessVersionType.Published;
    OPMRouter.navigateWithCurrentRoute(versionType);
}
