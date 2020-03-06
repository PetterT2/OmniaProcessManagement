import { Inject, Injectable, ServiceContainer, OmniaContext, ResolvablePromise } from '@omnia/fx';
import { InstanceLifetimes, TokenBasedRouteStateData, Guid, GuidValue } from '@omnia/fx-models';
import { TokenBasedRouter } from '@omnia/fx/ux';
import { OPMRoute, ProcessStep, Process, ProcessVersionType, OPMRouteStateData, OPMEnterprisePropertyInternalNames, Enums, IdDict, Version, ProcessStepType, ExternalProcessStep, ProcessReference } from '../models';
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

    private readyPromise: ResolvablePromise<void> = new ResolvablePromise<void>();

    constructor() {
        super('pm')

        this.readyPromise.resolve();
    }

    /**
    * Implement abstract function
    */
    protected buildContextPath(routeContext: OPMRoute): string {
        let contextPath = '';
        let connect = '';

        if (routeContext && routeContext.processStepId) {
            if (routeContext.externalParents) {
                routeContext.externalParents.forEach(parent => {
                    contextPath += connect + this.buildPath(parent.processStepId, parent.version);
                    connect = '/';
                });
            }

            contextPath += connect + this.buildPath(routeContext.processStepId, routeContext.version);

            if (routeContext.globalRenderer) {
                contextPath += '/g';
            }

        }
        return contextPath;
    }

    private buildPath(processStepId: GuidValue, version: Version) {
        let path = processStepId.toString().toLowerCase();
        if (OPMSpecialRouteVersion.isPreview(version)) {
            path += '/v-preview';
        }
        else if (!OPMSpecialRouteVersion.isLatestPublished(version)) {
            path += `/v-${version.edition}-${version.revision}`;
        }
        return path;
    }


    /**
      * Implement abstract function
      */
    protected resolveRouteFromPath(path: string): OPMRoute {
        let route: OPMRoute = { externalParents: [] } as OPMRoute;

        if (path.endsWith('/g')) {
            route.globalRenderer = true;
            path = path.substr(0, path.length - '/g'.length);
        }

        let segments = path.split('/');

        for (let segment of segments) {
            if (route.processStepId && Guid.isValid(segment)) {
                route.externalParents.push({
                    processStepId: route.processStepId,
                    version: route.version !== undefined ? route.version : OPMSpecialRouteVersion.LatestPublished
                });
                route.processStepId = null;
                route.version = undefined;
            }

            if (!route.processStepId) {
                route.processStepId = new Guid(segment);
            }
            else if (segment.startsWith('v-') && route.version === undefined) {
                segment = segment.replace('v-', '');
                if (segment == 'preview')
                    route.version = OPMSpecialRouteVersion.Preview
                else {
                    let versionNumbers = segment.split('-');
                    route.version = OPMSpecialRouteVersion.generateVersion(versionNumbers[0], versionNumbers[1])
                }
            }
            else {
                throw `Invalid OPM route path: ${path}`;
            }
        }

        if (route.version === undefined) {
            route.version = OPMSpecialRouteVersion.LatestPublished;
        }

        return route;
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
            let currentReadyPromise = this.readyPromise.promise;
            let newReadyPromise = new ResolvablePromise<void>();

            this.readyPromise = newReadyPromise;

            currentReadyPromise.then(() => {
                let title = this.multilingualStore.getters.stringValue(processStep.title);

                if (this.currentProcessId == process.id.toString().toLowerCase() &&
                    this.currentProcessStepId == processStep.id.toString().toLowerCase() &&
                    this.currentTitle == title) {

                    newReadyPromise.resolve();
                    resolve();
                }
                else {
                    //let processIdChanged = this.currentProcessId && this.currentProcessId.toString().toLowerCase() != process.id.toString().toLowerCase();

                    this.currentProcessId = process.id.toString().toLowerCase();
                    this.currentProcessStepId = processStep.id.toString().toLowerCase();
                    this.currentTitle = title;

                    this.generateOPMRouteData(process, processStep, rendererOption).then(({ opmRoute, processReference }) => {
                        if (processReference) {
                            this.protectedNavigate(title, opmRoute, { processId: process.id });
                            this.currentProcessStore.actions.setProcessToShow.dispatch(processReference).then(() => {

                                newReadyPromise.resolve();
                                resolve();
                            }).catch((err) => {
                                newReadyPromise.resolve();
                                reject(err);
                            });
                        }
                        else {
                            let reason = `Cannot find process step with id: ${processStep.id} in the process with id: ${process.id}`;
                            console.warn(reason);

                            newReadyPromise.resolve();
                            reject(reason);
                        }
                    }).catch((err) => {
                        newReadyPromise.resolve();
                        reject(err);
                    })
                }
            });
            this.readyPromise
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
            let newProcessId = this.routeContext.stateData && this.routeContext.stateData.processId || '';
            let version = this.routeContext.route.version;

            if (this.currentProcessStepId == newProcessStepId.toString().toLowerCase() &&
                this.currentProcessId == newProcessId.toString().toLowerCase()) {
                resolve();
            }
            else {
                if (newProcessStepId) {
                    let loadProcessPromises: Array<Promise<Process>> = [];
                    loadProcessPromises.push(this.currentProcessStore.actions.ensureRelavantProcess.dispatch(newProcessStepId, version));

                    if (this.routeContext.route.externalParents) {
                        this.routeContext.route.externalParents.forEach(parent => {
                            loadProcessPromises.push(new Promise<Process>((resolve, reject) => {
                                this.currentProcessStore.actions.ensureRelavantProcess.dispatch(parent.processStepId, parent.version).then(resolve).catch(err => {
                                    //If the linked parent process load failed, the current flow should continue. Only the breadcrumb will be effected

                                    let versionLabel = OPMSpecialRouteVersion.generateVersionLabel(parent.version);
                                    console.error(`Cannot find valid ${versionLabel}-version linked parent process for process step with id: ${parent.processStepId}. ${err}. This could affect the breadcrumb`)
                                    resolve(null);
                                })
                            }))
                        });
                    }
                    Promise.all(loadProcessPromises).then((processes) => {
                        let process = processes[0];

                        //The server-side already check the valid data, otherise it will throw exception. So we don't need to check null here
                        //If anycase the processStep ends up with null value, please re-verify the flow. it could be something else wrong
                        let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, newProcessStepId);

                        this.navigate(process, processStepRef.desiredProcessStep).then(resolve).catch(reject);
                    }).catch((errMsg) => {
                        let versionLabel = OPMSpecialRouteVersion.generateVersionLabel(version);

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


    private generateOPMRouteData(process: Process, processStep: ProcessStep, rendererOption: ProcessRendererOptions = ProcessRendererOptions.CurrentRenderer) {
        return new Promise<{ opmRoute: OPMRoute, processReference: ProcessReference }>((resolve, reject) => {
            let globalRenderer = rendererOption === ProcessRendererOptions.CurrentRenderer && this.routeContext.route ?
                this.routeContext.route.globalRenderer : rendererOption === ProcessRendererOptions.ForceToGlobalRenderer;


            let processStepIdNavigateTo = processStep.id.toString().toLowerCase();
            let isExternal: boolean = false;
            let version = this.routeContext.route ? this.routeContext.route.version :
                process.versionType == ProcessVersionType.Archived ? OPMSpecialRouteVersion.generateVersion(
                    process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition],
                    process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMRevision]
                ) : OPMSpecialRouteVersion.LatestPublished;


            if (processStep.type == ProcessStepType.External) {
                isExternal = true;
                processStepIdNavigateTo = (processStep as ExternalProcessStep).rootProcessStepId.toString().toLowerCase();
                version = OPMSpecialRouteVersion.LatestPublished;

                if (!this.routeContext.route) {
                    throw `Cannot do the first navigation to external process`;
                }
            }

            let currentParents: Array<{ processStepId: GuidValue, version?: Version }> = [];
            if (this.routeContext.route) {
                if (this.routeContext.route.externalParents) {
                    currentParents = currentParents.concat(this.routeContext.route.externalParents);
                }

                if (isExternal) {

                    let processStepRef = OPMUtils.getProcessStepInProcess(process.rootProcessStep, processStep.id);

                    if (processStepRef) {
                        currentParents.push({
                            processStepId: processStepRef.parentProcessSteps.length > 0 ?
                                processStepRef.parentProcessSteps[processStepRef.parentProcessSteps.length - 1].id : processStep.id,
                            version: this.routeContext.route.version //If navigate to external then this.routeContext.route should have value
                        });
                    }
                }
            }

            let externalParents: Array<{ processStepId: GuidValue, version?: Version }> = [];

            for (let parent of currentParents) {
                let relevantProcess = this.currentProcessStore.getters.relevantProcess(parent.processStepId);

                if (!relevantProcess) {
                    externalParents = [];
                    break;
                }

                let parentProcess = relevantProcess.process;
                let stepIdDict = relevantProcess.processStepIdDict;

                if (isExternal && parentProcess.rootProcessStep.id.toString().toLowerCase() != processStepIdNavigateTo.toString().toLowerCase()) {
                    externalParents.push(parent);
                }
                else if (!isExternal && !stepIdDict[processStepIdNavigateTo]) {
                    externalParents.push(parent);
                }
                else {
                    if (isExternal)
                        version = parent.version;

                    break;
                }
            }

            let opmRoute: OPMRoute = {
                externalParents: externalParents,
                globalRenderer: globalRenderer,
                processStepId: processStepIdNavigateTo,
                version: version
            }

            this.currentProcessStore.actions.ensureRelavantProcess.dispatch(processStepIdNavigateTo, version).then(process => {
                let processReference = OPMUtils.generateProcessReference(process, processStepIdNavigateTo);
                resolve({
                    opmRoute: opmRoute,
                    processReference: processReference
                });
            }).catch(reject);
        });
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

