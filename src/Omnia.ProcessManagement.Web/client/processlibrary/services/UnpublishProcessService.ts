import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService, Process, Enums, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest, Workflow } from '../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class UnpublishProcessService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    constructor() {
    }

    public unpublishProcess = (opmProcessId: string) => {
        return new Promise<boolean>((resolve, reject) => {
            let params = {
                opmProcessId: opmProcessId
            }
            this.httpClient.get<IHttpApiOperationResult<boolean>>('/api/unpublish', { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}