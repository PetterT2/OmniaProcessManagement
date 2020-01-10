import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { OPMService } from '../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class UnpublishProcessService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    
    constructor() {
    }

    public unpublishProcess = (opmProcessId: string) => {
        return new Promise<boolean>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<boolean>>(`/api/unpublish/${opmProcessId}`).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}