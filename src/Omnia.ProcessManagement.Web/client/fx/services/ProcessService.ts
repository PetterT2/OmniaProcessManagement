import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, ProcessActionModel, Process, ProcessVersionType, ProcessStep, Enums, ProcessData, IdDict, ProcessWorkingStatus } from '../models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(OmniaContext) private omniaContext: OmniaContext;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
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

    public getProcessData = (processStepId: GuidValue, hash: string, versionType: ProcessVersionType) => {
        return new Promise<ProcessData>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ProcessData>>(`/api/processes/processdata/${processStepId}/${hash}/${versionType}`).then((response) => {
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

    public getPublishedProcessByProcessStepId = (processStepId: GuidValue) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Process>>(`/api/processes/byprocessstep/${processStepId}`).then((response) => {
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
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Process>>(`/api/processes/byprocessstep/${processStepId}/preview`).then((response) => {
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

    private generateClientSideData = (processes: Array<Process>) => {
        return this.omniaContext.user.then((user) => {
            let currentUserLoginName = user.loginName.toLowerCase();
            for (let process of processes) {
                //We want to keep this property as readonly. So we set the value by this way (only here)
                (process as any).isCheckedOutByCurrentUser = process.checkedOutBy.toLowerCase() == currentUserLoginName

                this.setProcessStepMultilingualTitle(process.rootProcessStep);
            }
        })
    }

    private setProcessStepMultilingualTitle = (processStep: ProcessStep) => {
        processStep.multilingualTitle = this.multilingualStore.getters.stringValue(processStep.title);
        if (processStep.processSteps) {
            for (let childProcessStep of processStep.processSteps) {
                this.setProcessStepMultilingualTitle(childProcessStep);
            }
        }
    }

}