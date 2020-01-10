import { Inject, Injectable, ServiceContainer } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData, RouteOptions } from '../models';
import { ProcessStore, CurrentProcessStore } from '../stores';
import { OPMUtils } from '../utils';
import { MultilingualStore } from '@omnia/fx/store';

const processVersionLabels = {
    [ProcessVersionType.Draft]: 'draft',
    [ProcessVersionType.CheckedOut]: 'checked out',
    [ProcessVersionType.Archived]: 'published',
    [ProcessVersionType.Published]: 'latest published'
}

@Injectable({ lifetime: InstanceLifetimes.Singelton })
class InternalOPMRouter extends TokenBasedRouter<OPMRoute, OPMRouteStateData>{
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    private currentTitle = '';
    private currentProcessId = '';
    private currentProcessStepId = '';
    private currentRouteOption = '';

    constructor() {
        super('pm')
    }

    /**
    * Implement abstract function
    */
    protected buildContextPath(routeContext: OPMRoute): string {
        let contextPath = '';

        if (routeContext && routeContext.processStepId) {
            contextPath = routeContext.processStepId.toString() + routeContext.routeOption.toString();
            contextPath = contextPath.toLowerCase();
        }
        return contextPath;
    }

    /**
    * Implement abstract function
    */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let context: OPMRoute = null;
        let routeOption: RouteOptions = RouteOptions.publishedInBlockRenderer;
        path = path.toLowerCase();

        if (path.endsWith(RouteOptions.previewInGlobalRenderer)) {
            path = path.replace(RouteOptions.previewInGlobalRenderer, '');
            routeOption = RouteOptions.previewInGlobalRenderer;
        }
        else if (path.endsWith(RouteOptions.previewInBlockRenderer)) {
            path = path.replace(RouteOptions.previewInBlockRenderer, '');
            routeOption = RouteOptions.previewInBlockRenderer;
        }
        else if (path.endsWith(RouteOptions.publishedInGlobalRenderer)) {
            path = path.replace(RouteOptions.publishedInGlobalRenderer, '');
            routeOption = RouteOptions.publishedInGlobalRenderer;
        }


        if (path) {
            path = path.split('&')[0];
            context = {
                processStepId: new Guid(path),
                routeOption: routeOption
            }
        }

        return context;
    }

    /**
    * Override protected function logic
    */
    protected protectedNavigate(title: string, context: OPMRoute, stateData: OPMRouteStateData = null) {
        super.protectedNavigate(title, context, stateData);
    }

    /**
    * Override protected function logic
    */
    protected protectedClearRoute() {
        super.protectedClearRoute();
    }

    public navigate(process: Process, processStep: ProcessStep, routeOption?: RouteOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            let title = this.multilingualStore.getters.stringValue(processStep.title);
            routeOption = routeOption != null ? routeOption : this.routeContext.route && this.routeContext.route.routeOption || RouteOptions.publishedInBlockRenderer;

            if (this.currentProcessId == process.id.toString().toLowerCase() &&
                this.currentProcessStepId == processStep.id.toString().toLowerCase() &&
                this.currentTitle == title) {

                resolve();
            }
            else {
                this.currentProcessId = process.id.toString().toLowerCase();
                this.currentProcessStepId = processStep.id.toString().toLowerCase();
                this.currentTitle = title;

                this.protectedNavigate(title, { routeOption: routeOption, processStepId: processStep.id }, { versionType: process.versionType });

                let processRefrerence = OPMUtils.generateProcessReference(process, processStep.id);
                if (processRefrerence) {
                    this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {
                        resolve();
                    }).catch(reject);
                }
                else {
                    let reason = `Cannot find valid ${processVersionLabels[process.versionType]}-version process for the process step with id: ${processStep.id}`;
                    console.warn(reason);
                    reject(reason);
                }
            }
        })
    }

    public clearRoute() {
        this.currentTitle = '';
        this.currentProcessId = '';
        this.currentProcessStepId = '';
        this.currentRouteOption = '';

        this.currentProcessStore.actions.setProcessToShow.dispatch(null).then(() => {
            this.protectedClearRoute();
        })
    }

    public navigateWithCurrentRoute(preview: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let newProcessStepId = this.routeContext.route && this.routeContext.route.processStepId || '';

            let loadProcessPromise: Promise<Process> = preview ?
                this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(newProcessStepId) :
                this.processStore.actions.loadPublishedProcessByProcessStepId.dispatch(newProcessStepId)

            if (newProcessStepId) {
                loadProcessPromise.then((process) => {

                    //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                    //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                    let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                    this.navigate(process, processStepRef.desiredProcessStep).then(resolve).catch(reject);
                }).catch((errMsg) => {
                    let versionLabel = preview ? 'preview' : 'published';
                    let reason = `Cannot find valid ${versionLabel}-version process for the process step with id: ${newProcessStepId}. ` + errMsg;
                    console.warn(reason);
                    reject(reason);
                })
            }
            else {
                reject(`Cannot find valid process match to current route`);
            }
        })
    }
}

export const OPMRouter: InternalOPMRouter = ServiceContainer.createInstance(InternalOPMRouter);

const currentProcessStore: CurrentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);

OPMRouter.onNavigate.subscribe(ctx => {
    if (ctx.route && ctx.stateData) {
        let preview = ctx.route.routeOption == RouteOptions.previewInBlockRenderer ||
            ctx.route.routeOption == RouteOptions.previewInGlobalRenderer ? true : false

        OPMRouter.navigateWithCurrentRoute(preview);
        //OPMRouter.navigateWithCurrentRoute(ctx.stateData.versionType);
    }
    else {
        OPMRouter.clearRoute();
    }
})

if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
    let preview = OPMRouter.routeContext.route.routeOption == RouteOptions.previewInBlockRenderer ||
        OPMRouter.routeContext.route.routeOption == RouteOptions.previewInGlobalRenderer ? true : false

    OPMRouter.navigateWithCurrentRoute(preview);
}

currentProcessStore.actions.deleteProcessStep.onDispatched(() => {
    let currentReferenceData = currentProcessStore.getters.referenceData();
    let processRefrerence = OPMUtils.generateProcessReference(currentReferenceData.process, currentReferenceData.current.parentProcessStep.id);
    currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence);
})