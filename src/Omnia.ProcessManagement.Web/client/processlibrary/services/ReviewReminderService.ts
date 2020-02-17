import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable, OmniaContext } from '@omnia/fx';
import { UserService } from '@omnia/fx/services';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { OPMService, WorkflowTask, ReviewReminderTask } from '../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ReviewReminderService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(UserService) private userService: UserService;
    constructor() {
    }

    public getReviewReminderTask = (spItemId: number, teamAppId: GuidValue): Promise<ReviewReminderTask> => {
        return new Promise<ReviewReminderTask>((resolve, reject) => {

            this.httpClient.get<IHttpApiOperationResult<ReviewReminderTask>>(`/api/reviewreminder/${teamAppId}/${spItemId}`).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public closeReviewReminderTask = (spItemId: number, teamAppId: GuidValue): Promise<void> => {
        return new Promise<void>((resolve, reject) => {

            this.httpClient.post<IHttpApiOperationResult<void>>(`/api/reviewreminder/${teamAppId}/${spItemId}/closetask`).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public setNewReviewDate = (spItemId: number, teamAppId: GuidValue, newReviewDate: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {

            this.httpClient.post<IHttpApiOperationResult<void>>(`/api/reviewreminder/${teamAppId}/${spItemId}/newreviewdate`, newReviewDate).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}
