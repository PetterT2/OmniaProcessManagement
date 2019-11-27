import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, ProcessActionModel, Process, ProcessDataWithAuditing, ProcessVersionType, ProcessLibraryRequest, DraftProcessesResponse } from '../models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public createDraftProcess = (processActionModel: ProcessActionModel) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/createdraft', processActionModel).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public checkinProcess = (processActionModel: ProcessActionModel) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/processes/checkin', processActionModel).then((response) => {
                if (response.data.success) {
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
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcessData = (processStepId: GuidValue, hash: string) => {
        return new Promise<ProcessDataWithAuditing>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ProcessDataWithAuditing>>(`/api/processes/processdata/${processStepId}/${hash}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getFilteringOptions = (webUrl: string, column: string) => {
        return new Promise<Array<string>>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Array<string>>>(`/api/processes/filteringoptions`, {
                params: {
                    column: column,
                    webUrl: webUrl
                }
            }).then((response) => {
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

    public getProcessByProcessStepId = (processStepId: GuidValue, versionType: ProcessVersionType) => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Process>>(`/api/processes/byprocessstep/${processStepId}/${versionType}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }

    public getProcessesBySite = (request: ProcessLibraryRequest) => {
        return new Promise<DraftProcessesResponse>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<DraftProcessesResponse>>(`/api/processes/drafts`, request).then((response) => {
                if (response.data.success) {
                    response.data.data.processes.forEach(p => {
                        p.rootProcessStep.multilingualTitle = this.multilingualStore.getters.stringValue(p.rootProcessStep.title);
                    })
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }
}