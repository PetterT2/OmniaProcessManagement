import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService, Process, Enums, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest, Workflow, WorkflowTask } from '../../fx/models';
import { UserService } from '@omnia/fx/services';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class PublishProcessService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    @Inject(UserService) userService: UserService;
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

    public publishProcessWithApproval = (request: PublishProcessWithApprovalRequest): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/publish/withapproval', request).then(response => {
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

    public completeApprovalTask = (workflowTask: WorkflowTask): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>(`/api/publish/completeworkflow`, workflowTask).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getApprovalTaskById = (spItemId: number, teamAppId: GuidValue): Promise<WorkflowTask> => {
        return new Promise<WorkflowTask>((resolve, reject) => {

            this.httpClient.get<IHttpApiOperationResult<WorkflowTask>>(`/api/publish/task/${teamAppId}/${spItemId}`).then(response => {
                if (response.data.success) {
                    this.generateClientSideData(response.data.data).then(() => {
                        resolve(response.data.data);
                    }).catch(reject)
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    private generateClientSideData = (workflowTask: WorkflowTask) => {
        let principalNames = [workflowTask.assignedUser, workflowTask.createdBy];

        return this.userService.resolveUsersByPrincipalNames(principalNames).then(users => {
            let assignedUser = users.find(u => u.userPrincipalName.toLowerCase() == workflowTask.assignedUser.toLowerCase());
            let createdByUser = users.find(u => u.userPrincipalName.toLowerCase() == workflowTask.createdBy.toLowerCase());

            workflowTask.assignedUserDisplayName = assignedUser ? assignedUser.displayName : workflowTask.assignedUser;
            workflowTask.createdByUserDisplayName = createdByUser ? createdByUser.displayName : workflowTask.createdBy;
        })
    }
}
