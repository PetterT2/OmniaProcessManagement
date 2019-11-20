import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue } from '@omnia/fx/models';
import { OPMService, ProcessActionModel, Process, ProcessDataWithAuditing, ProcessVersionType } from '../fx/models';
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

    public getProcessData = (processStepId: GuidValue, versionType: ProcessVersionType, hash: string) => {
        return new Promise<ProcessDataWithAuditing>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ProcessDataWithAuditing>>(`/api/processes/processdata/${processStepId}/${versionType}/${hash}`).then((response) => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }
}