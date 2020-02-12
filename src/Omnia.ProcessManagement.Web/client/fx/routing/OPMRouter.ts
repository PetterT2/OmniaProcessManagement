import { Inject, Injectable, ServiceContainer, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData, OPMEnterprisePropertyInternalNames, Version } from '../models';
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

    constructor() {
        super('pm')
    }

    /**
    * Implement abstract function
    */
    protected buildContextPath(routeContext: OPMRoute): string {
        let contextPath = '';

        if (routeContext && routeContext.processStepId) {
            contextPath = routeContext.processStepId.toString();

            if (routeContext.version == null) {
                contextPath += '/preview';
            }
            else if (routeContext.version.edition != 0 || routeContext.version.revision != 0) {
                contextPath += `/${routeContext.version.edition}/${routeContext.version.revision}`;
            }

            if (routeContext.globalRenderer) {
                contextPath += `/g`;
            }

            contextPath = contextPath.toLowerCase();
        }
        return contextPath;
    }

    /**
    * Implement abstract function
    */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let context: OPMRoute = {} as OPMRoute;

        path = path.toLowerCase();

        if (path.endsWith('/preview/g')) {
            path = path.replace('/preview/g', '');
            context.version = null;
            context.globalRenderer = true;
        }
        else if (path.endsWith('/preview')) {
            path = path.replace('/preview', '');
            context.version = null;
            context.globalRenderer = false;
        }
        else if (/^[^\/]+\/\d\/\d(\/g)?$/.test(path)) {
            let segments = path.split('/');
            path = segments[0];
            context.version = { edition: parseInt(segments[1]), revision: parseInt(segments[2]) };
            context.globalRenderer = segments.length == 4;
        }
        else if (path.endsWith('/g')) {
            path = path.replace('/g', '');
            context.version = { edition: 0, revision: 0 };
            context.globalRenderer = true;
        }
        else {
            context.version = { edition: 0, revision: 0 };
            context.globalRenderer = false;
        }

        if (path) {
            context.processStepId = (new Guid(path)).toString();
        }
        else {
            context = null;
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

    public navigate(process: Process, processStep: ProcessStep, globalRenderer: boolean = undefined, version: Version = undefined): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            let title = this.multilingualStore.getters.stringValue(processStep.title);
            let routeOption: OPMRoute = {
                processStepId: processStep.id,
                globalRenderer: globalRenderer != null ? globalRenderer : (this.routeContext.route ? this.routeContext.route.globalRenderer : true),
                version: version !== undefined ? version : (this.routeContext.route ? this.routeContext.route.version : null)
            }

            if (this.currentProcessId == process.id.toString().toLowerCase() &&
                this.currentProcessStepId == processStep.id.toString().toLowerCase() &&
                this.currentTitle == title) {

                resolve();
            }
            else {
                this.currentProcessId = process.id.toString().toLowerCase();
                this.currentProcessStepId = processStep.id.toString().toLowerCase();
                this.currentTitle = title;

                this.protectedNavigate(title, routeOption, { versionType: process.versionType });

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

        this.currentProcessStore.actions.setProcessToShow.dispatch(null).then(() => {
            this.protectedClearRoute();
        })
    }

    public navigateWithCurrentRoute(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let newProcessStepId = this.routeContext.route && this.routeContext.route.processStepId || '';
            let version = this.routeContext.route.version;

            if (newProcessStepId) {
                let loadProcessPromise: Promise<Process> = version ?
                    this.processStore.actions.loadProcessByProcessStepId.dispatch(newProcessStepId, version) :
                    this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(newProcessStepId).then(p => p.process)



                loadProcessPromise.then((process) => {

                    //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                    //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                    let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                    this.navigate(process, processStepRef.desiredProcessStep).then(resolve).catch(reject);
                }).catch((errMsg) => {
                    let versionLabel = 'preview';
                    if (version) {
                        if (version.edition != 0 && version.revision != 0) {
                            versionLabel = `edition-${version.edition}-revision-${version.revision}-version`;
                        }
                        else
                            versionLabel = 'latest published';
                    }

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
const omniaContext: OmniaContext = ServiceContainer.createInstance(OmniaContext);

OPMRouter.onNavigate.subscribe(ctx => {
    if (ctx.route && ctx.stateData) {
        OPMRouter.navigateWithCurrentRoute();
    }
    else {
        OPMRouter.clearRoute();
    }
})


if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
    //We include a process-url in OPM Task email, and it will point to Processes.aspx with Preview-Global mode
    //Then we need to handle the preview-page settings and do the redirect logic if needed. (ProcessLibrary.tsx will take care of the logic)
    //Therefore, we only handle page-load-route here when it is in omnia app, or in an iframe, or not in Preview-Global

    if (!omniaContext.environment.omniaApp && window.self == window.top &&
        OPMRouter.routeContext.route.version == null &&
        OPMRouter.routeContext.route.globalRenderer) {
        //Let the ProcessLibrary.tsx handle the logic
    }
    else {
        OPMRouter.navigateWithCurrentRoute();
    }
}

