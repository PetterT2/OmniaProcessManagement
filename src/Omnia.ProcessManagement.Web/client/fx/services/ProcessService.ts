﻿import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, ProcessActionModel, Process, ProcessVersionType, ProcessStep, Enums, ProcessData, IdDict, ProcessWorkingStatus, ProcessCheckoutInfo, PreviewProcessWithCheckoutInfo, Version, ProcessStepType, InternalProcessStep, LightProcess } from '../models';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessSite } from '../../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(OmniaContext) private omniaContext: OmniaContext;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public getPublishedWithoutPermission = () => {
        return new Promise<Array<LightProcess>>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Array<LightProcess>>>('/api/processes/getpublishedwithoutpermission').then((response) => {
                if (response.data.success) {
                    response.data.data.forEach(p => {
                        p.multilingualTitle = this.multilingualStore.getters.stringValue(p.title);
                    })
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public checkIfDraftExists = (opmProcessId: string) => {
        return new Promise<boolean>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<boolean>>('/api/processes/checkifdraftexist/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public createDraftProcess = (processActionModel: ProcessActionModel) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/createdraft', processActionModel).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public createDraftProcessFromPublished = (opmProcessId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/createdraft/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public checkinProcess = (opmProcessId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/checkin/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public saveCheckedOutProcess = (processActionModel: ProcessActionModel) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/savecheckedout', processActionModel).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcessCheckoutInfo = (opmProcessId: GuidValue) => {
        return new Promise<ProcessCheckoutInfo>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ProcessCheckoutInfo>>(`/api/processes/checkoutinfo/${opmProcessId}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public checkoutProcess = (opmProcessId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/checkout/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public copyToNewProcess = (opmProcessId: GuidValue, processStepId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>(`/api/processes/copytonewprocess/${opmProcessId}/${processStepId}`).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public discardChangeProcess = (opmProcessId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/discardchange/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcess = (processId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Process>>(`/api/processes/${processId}`).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcessData = (processStepId: GuidValue, hash: string) => {
        return new Promise<ProcessData>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ProcessData>>(`/api/processes/processdata/${processStepId}/${hash}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public deleteDraftProcess = (opmProcessId: GuidValue) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.delete<IHttpApiOperationResult<void>>(`/api/processes/draft/${opmProcessId}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getArchivedOrPublishedProcessByProcessStepId = (processStepId: GuidValue, version: Version) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Process>>(`/api/processes/byprocessstep/${processStepId}/${version.edition}/${version.revision}`).then((response) => {
                if (response.data.success) {
                    this.generateClientSideData([response.data.data]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getPreviewProcessByProcessStepId = (processStepId: GuidValue) => {
        return new Promise<PreviewProcessWithCheckoutInfo>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<PreviewProcessWithCheckoutInfo>>(`/api/processes/byprocessstep/${processStepId}/preview`).then((response) => {
                if (response.data.success) {
                    let process = response.data.data.process;
                    this.generateClientSideData([process]);
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getDraftProcessesBySite = (teamAppId: GuidValue) => {
        return new Promise<Array<Process>>((resolve, reject) => {
            let params = {
                teamAppId: teamAppId
            };
            this.httpClient.get<IHttpApiOperationResult<Array<Process>>>(`/api/processes/draft`, { params: params }).then((response) => {
                if (response.data.success) {
                    let processes = response.data.data;
                    this.generateClientSideData(processes);
                    resolve(processes);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getPublishedProcessesBySite = (teamAppId: GuidValue) => {
        return new Promise<Array<Process>>((resolve, reject) => {
            let params = {
                teamAppId: teamAppId
            };
            this.httpClient.get<IHttpApiOperationResult<Array<Process>>>(`/api/processes/published`, { params: params }).then((response) => {
                if (response.data.success) {
                    let processes = response.data.data;
                    this.generateClientSideData(processes);
                    resolve(processes);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getDraftProcessWorkingStatus = (teamAppId: GuidValue, opmProcessIds: Array<GuidValue>) => {
        let params = {
            teamAppId: teamAppId
        };
        return new Promise<IdDict<ProcessWorkingStatus>>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<IdDict<ProcessWorkingStatus>>>(`/api/processes/draft/workingstatus`, opmProcessIds, { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getPublishedProcessWorkingStatus = (teamAppId: GuidValue, opmProcessIds: Array<GuidValue>) => {
        let params = {
            teamAppId: teamAppId
        };
        return new Promise<IdDict<ProcessWorkingStatus>>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<IdDict<ProcessWorkingStatus>>>(`/api/processes/published/workingstatus`, opmProcessIds, { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public checkIfDeletingProcessStepsAreBeingUsed = (processId: GuidValue, deletingProcessStepIds: Array<GuidValue>) => {
        return new Promise<boolean>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<boolean>>(`/api/processes/checkifdeletingprocessstepsarebeingused/${processId}`, deletingProcessStepIds).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public syncToSharePoint = (opmProcessId: GuidValue) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/processes/sync/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    resolve();
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public triggerArchive = (opmProcessId: GuidValue) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/processes/triggerarchive/' + opmProcessId).then((response) => {
                if (response.data.success) {
                    resolve();
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcessSiteByAppId = (teamAppId: GuidValue): Promise<ProcessSite> => {
        return new Promise<ProcessSite>((resolve, reject) => {

            this.httpClient.get<IHttpApiOperationResult<ProcessSite>>(`/api/processes/processsite/${teamAppId}`).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getProcessHistory = (opmProcessId: GuidValue) => {
        return new Promise<Array<Process>>((resolve, reject) => {

            this.httpClient.get<IHttpApiOperationResult<Array<Process>>>(`/api/processes/history/${opmProcessId}`).then(response => {
                if (response.data.success) {
                    let processes = response.data.data;
                    this.generateClientSideData(processes);
                    resolve(processes);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    private generateClientSideData = (processes: Array<Process>, ) => {
        for (let process of processes) {
            this.setProcessStepMultilingualTitle(process.rootProcessStep);
        }
    }

    private setProcessStepMultilingualTitle = (processStep: ProcessStep) => {
        processStep.multilingualTitle = this.multilingualStore.getters.stringValue(processStep.title);
        if (processStep.type == ProcessStepType.Internal) {
            if ((processStep as InternalProcessStep).processSteps) {
                for (let childProcessStep of (processStep as InternalProcessStep).processSteps) {
                    this.setProcessStepMultilingualTitle(childProcessStep);
                }
            }
        }
    }

}