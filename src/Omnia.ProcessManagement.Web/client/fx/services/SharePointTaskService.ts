import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, AuthorAndDefaultReaderUpdateInput, TaskRequest, GraphSharePointTaskResponse, CSOMSharePointTaskResponse} from '../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class SharePointTaskService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    constructor() {
    }

    public getTasksByGraph = (request: TaskRequest) => {

        return new Promise<GraphSharePointTaskResponse>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<GraphSharePointTaskResponse>>('/api/sharepointtasks/getbygraph', request).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getTasksByCSOM = (request: TaskRequest) => {

        return new Promise<CSOMSharePointTaskResponse>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<CSOMSharePointTaskResponse>>('/api/sharepointtasks/getbycsom', request).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

}