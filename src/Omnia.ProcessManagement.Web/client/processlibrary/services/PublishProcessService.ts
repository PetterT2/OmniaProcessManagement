import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid, GuidValue } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService, Process, Enums, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest } from '../../fx/models';

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

    public processingApprovalProcessAsync = (request: PublishProcessWithApprovalRequest): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/publish/processingapproval', request).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }
}
