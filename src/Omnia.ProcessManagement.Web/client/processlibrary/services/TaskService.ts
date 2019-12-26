import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable, OmniaContext } from '@omnia/fx';
import { UserService } from '@omnia/fx/services';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { OPMService, WorkflowTask } from '../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class TaskService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(UserService) private userService: UserService;
    constructor() {
    }

    public getApprovalTaskById = (spItemId: number, teamAppId: GuidValue): Promise<WorkflowTask> => {
        return new Promise<WorkflowTask>((resolve, reject) => {

            this.httpClient.get<IHttpApiOperationResult<WorkflowTask>>(`/api/task/approval/${teamAppId}/${spItemId}`).then(response => {
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
