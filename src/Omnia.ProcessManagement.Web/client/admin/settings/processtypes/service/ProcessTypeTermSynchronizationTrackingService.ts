import { Inject, HttpClientConstructor, HttpClient, Injectable, Utils } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, GuidValue } from '@omnia/fx/models';
import { OPMService, ProcessTypeTermSynchronizationStatus } from '../../../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessTypeTermSynchronizationTrackingService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() { }

    public triggerSync = (termSetId: GuidValue): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            let params = {
                termSetId: termSetId
            }
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/processtypetermsynchronizationtracking/triggersync', null, { params: params }).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public triggerSyncFromSharePoint = (termSetId: GuidValue): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            let params = {
                termSetId: termSetId
            }
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/processtypetermsynchronizationtracking/triggersyncfromsharepoint', null, { params: params }).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public getSyncStatus = (termSetId: GuidValue): Promise<ProcessTypeTermSynchronizationStatus> => {
        return new Promise<ProcessTypeTermSynchronizationStatus>((resolve, reject) => {
            let params = {
                termSetId: termSetId
            }
            this.httpClient.get<IHttpApiOperationResult<ProcessTypeTermSynchronizationStatus>>('/api/processtypetermsynchronizationtracking/syncstatus', { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }
}