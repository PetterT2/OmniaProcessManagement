import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService, Process, Enums, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest, Workflow, WorkflowApprovalTask } from '../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class PublishProcessService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    constructor() {
    }

    public publishProcessWithoutApproval = (request: PublishProcessWithoutApprovalRequest): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/publish/withoutapproval', request).then(result => {
                if (result.data.success) {
                    resolve();
                }
                else reject(result.data.errorMessage)
            })
        });
    }

    public processingPublishProcessWithoutApproval = (request: PublishProcessWithoutApprovalRequest): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/publish/processingwithoutapproval', request).then(result => {
                if (result.data.success) {
                    resolve();
                }
                else reject(result.data.errorMessage)
            })
        });
    }

    public publishProcessWithApproval = (request: PublishProcessWithApprovalRequest): Promise<Process> => {
        return new Promise<Process>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Process>>('/api/publish/withapproval', request).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public processingApprovalProcess = (request: PublishProcessWithApprovalRequest): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/publish/processingapproval', request).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getWorkflow = (opmProcessId: GuidValue, webUrl: string): Promise<Workflow> => {
        return new Promise<Workflow>((resolve, reject) => {
            let params = {
                webUrl: webUrl
            }
            this.httpClient.get<IHttpApiOperationResult<Workflow>>(`/api/publish/workflow/${opmProcessId}`, { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public cancelWorkflow = (opmProcessId: GuidValue): Promise<Workflow> => {
        return new Promise<Workflow>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Workflow>>(`/api/publish/cancelworkflow/${opmProcessId}`).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public processingCancelWorkflow = (opmProcessId: GuidValue, workflowId: GuidValue): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<void>>(`/api/publish/processingcancelworkflow/${opmProcessId}/${workflowId}`).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public completeApprovalTask = (workflowTask: WorkflowApprovalTask): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>(`/api/publish/completeworkflow`, workflowTask).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public processingCompleteApprovalTask = (workflowTask: WorkflowApprovalTask): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>(`/api/publish/processingcompleteworkflow`, workflowTask).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}
