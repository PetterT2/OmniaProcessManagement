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
    [ProcessVersionType.Published]: 'published'
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
            contextPath = routeContext.processStepId.toString().toLowerCase();

            contextPath = routeContext.routeOption.toString() + '/' + contextPath;
        }
        return contextPath;
    }

    /**
    * Implement abstract function
    */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let context: OPMRoute = null;
        let routeOption: RouteOptions = RouteOptions.normal;
        path = path.toLowerCase();

        if (path.startsWith(RouteOptions.previewDraft)) {
            path = path.substr(`${RouteOptions.previewDraft}/`.length);
            routeOption = RouteOptions.previewDraft;
        }
        if (path.startsWith(RouteOptions.viewLatestPublishedInGlobal)) {
            path = path.substr(`${RouteOptions.viewLatestPublishedInGlobal}/`.length);
            routeOption = RouteOptions.viewLatestPublishedInGlobal;
        }
        if (path) {
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
            if (routeOption === undefined || routeOption === null) {
                routeOption = this.routeContext.route && this.routeContext.route.routeOption || RouteOptions.normal;
            }
            let title = this.multilingualStore.getters.stringValue(processStep.title);

            if (this.currentProcessId == process.id.toString().toLowerCase() &&
                this.currentProcessStepId == processStep.id.toString().toLowerCase() &&
                this.currentRouteOption == routeOption &&
                this.currentTitle == title) {

                resolve();
            }
            else {
                this.currentProcessId = process.id.toString().toLowerCase();
                this.currentProcessStepId = processStep.id.toString().toLowerCase();
                this.currentRouteOption = routeOption;
                this.currentTitle = title;

                this.protectedNavigate(title, { routeOption: routeOption, processStepId: processStep.id }, { versionType: process.versionType });

                let processRefrerence = OPMUtils.generateProcessReference(process, processStep.id);
                if (processRefrerence) {
                    this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {
                        console.log('set process to show');
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
                    let reason = `Cannot find valid ${processVersionLabels[processVersionType]}-version process for the process step with id: ${newProcessStepId}. ` + errMsg;
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

OPMRouter.onNavigate.subscribe(ctx => {
    if (ctx.route && ctx.stateData) {
        OPMRouter.navigateWithCurrentRoute(ctx.stateData.versionType);
    }
    else {
        OPMRouter.clearRoute();
    }
})

if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
    let versionType = OPMRouter.routeContext.route.routeOption == RouteOptions.previewDraft ? ProcessVersionType.Draft : ProcessVersionType.Published;
    OPMRouter.navigateWithCurrentRoute(versionType);
}
