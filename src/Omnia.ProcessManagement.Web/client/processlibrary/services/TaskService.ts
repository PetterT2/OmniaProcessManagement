import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService, Process, Enums, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest, Workflow, WorkflowTask, WorkflowApprovalTask } from '../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class TaskService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    constructor() {
    }

    public getById = (spItemId: number, webUrl: string): Promise<WorkflowApprovalTask> => {
        return new Promise<WorkflowApprovalTask>((resolve, reject) => {
            let params = { webUrl: webUrl };
            this.httpClient.get<IHttpApiOperationResult<WorkflowApprovalTask>>(`/api/task/${spItemId}`, { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}
