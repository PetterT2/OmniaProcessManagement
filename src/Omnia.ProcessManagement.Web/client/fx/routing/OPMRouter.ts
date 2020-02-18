import { Inject, Injectable, ServiceContainer, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData, OPMEnterprisePropertyInternalNames, Enums, IdDict } from '../models';
import { ProcessStore, CurrentProcessStore } from '../stores';
import { OPMUtils } from '../utils';
import { MultilingualStore } from '@omnia/fx/store';
import { OPMSpecialRouteVersion } from '../constants';



export enum ProcessRendererOptions {
    CurrentRenderer = 0,
    ForceToGlobalRenderer = 1,
    ForceToBlockRenderer = 2
}


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

    private currentPreviewProcessId: GuidValue = null;
    private processStepIdsInCurrentPreviewProcess: IdDict<boolean> = {};

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

            if (OPMSpecialRouteVersion.isPreview(routeContext.version)) {
                contextPath += '/preview';
            }
            else if (!OPMSpecialRouteVersion.isPublished(routeContext.version)) {
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
            context.version = OPMSpecialRouteVersion.Preview;
            context.globalRenderer = true;
        }
        else if (path.endsWith('/preview')) {
            path = path.replace('/preview', '');
            context.version = OPMSpecialRouteVersion.Preview;
            context.globalRenderer = false;
        }
        else if (/^[^\/]+\/\d\/\d(\/g)?$/.test(path)) {
            let segments = path.split('/');
            path = segments[0];
            context.version = OPMSpecialRouteVersion.generateVersion(segments[1], segments[2])
            context.globalRenderer = segments.length == 4;
        }
        else if (path.endsWith('/g')) {
            path = path.replace('/g', '');
            context.version = OPMSpecialRouteVersion.Published;
            context.globalRenderer = true;
        }
        else {
            context.version = OPMSpecialRouteVersion.Published;
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

    public navigate(process: Process, processStep: ProcessStep, rendererOption: ProcessRendererOptions = ProcessRendererOptions.CurrentRenderer): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            let title = this.multilingualStore.getters.stringValue(processStep.title);

            let globalRenderer = rendererOption === ProcessRendererOptions.CurrentRenderer ?
                (this.routeContext.route && this.routeContext.route.globalRenderer) : rendererOption === ProcessRendererOptions.ForceToGlobalRenderer;

            let version = this.routeContext.route ? this.routeContext.route.version :
                process.versionType == ProcessVersionType.Archived ? OPMSpecialRouteVersion.generateVersion(
                    process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition],
                    process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMRevision]
                ) : OPMSpecialRouteVersion.Published;

            let routeOption: OPMRoute = {
                processStepId: processStep.id,
                globalRenderer: globalRenderer,
                version: version
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

                this.protectedNavigate(title, routeOption, { processId: process.id });

                let processRefrerence = OPMUtils.generateProcessReference(process, processStep.id);
                if (processRefrerence) {
                    this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {
                        resolve();
                    }).catch(reject);
                }
                else {
                    let reason = `Cannot find process step with id: ${processStep.id} in the process with id: ${process.id}`;
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
        this.currentPreviewProcessId = null;
        this.processStepIdsInCurrentPreviewProcess = {};

        this.currentProcessStore.actions.setProcessToShow.dispatch(null).then(() => {
            this.protectedClearRoute();
        })
    }

    public navigateWithCurrentRoute(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let newProcessStepId = this.routeContext.route && this.routeContext.route.processStepId || '';
            let newProcessId = this.routeContext.stateData && this.routeContext.stateData.processId || '';
            let version = this.routeContext.route.version;
            let isPreview = OPMSpecialRouteVersion.isPreview(version);

            if (this.currentProcessStepId == newProcessStepId.toString().toLowerCase() &&
                this.currentProcessId == newProcessId.toString().toLowerCase()) {
                resolve();
            }
            else {
                if (newProcessStepId) {
                    let loadProcessPromise: Promise<Process> = null;

                    if (isPreview) {
                        if (this.currentPreviewProcessId && this.processStepIdsInCurrentPreviewProcess[newProcessStepId.toString().toLowerCase()]) {
                            let process = this.processStore.getters.process(this.currentPreviewProcessId);
                            loadProcessPromise = Promise.resolve(process);
                        }
                        else {
                            loadProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(newProcessStepId).then(p => {
                                this.currentPreviewProcessId = p.process.id;
                                let stepIds = OPMUtils.getAllProcessStepIds(p.process.rootProcessStep);
                                stepIds.forEach(id => { this.processStepIdsInCurrentPreviewProcess[id.toString().toLowerCase()] = true; });
                                return p.process;
                            })
                        }
                    }
                    else {
                        this.currentPreviewProcessId = null;
                        this.processStepIdsInCurrentPreviewProcess = {};
                        loadProcessPromise = this.processStore.actions.loadProcessByProcessStepId.dispatch(newProcessStepId, version)
                    }

                    loadProcessPromise.then((process) => {

                        //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                        //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                        this.navigate(process, processStepRef.desiredProcessStep).then(resolve).catch(reject);
                    }).catch((errMsg) => {
                        let versionLabel = isPreview ? 'preview' :
                            OPMSpecialRouteVersion.isPublished(version) ? 'latest published' : `edition-${version.edition}-revision-${version.revision}-version`;

                        let reason = `Cannot find valid ${versionLabel}-version process for the process step with id: ${newProcessStepId}. ` + errMsg;
                        console.warn(reason);
                        reject(reason);
                    });
                }
                else {
                    reject(`Cannot find valid process match to current route`);
                }
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

