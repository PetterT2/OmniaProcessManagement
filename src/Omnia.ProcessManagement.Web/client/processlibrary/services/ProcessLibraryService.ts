import { Inject, HttpClientConstructor, HttpClient, Utils as omniaUtils, Utils, Injectable } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, Guid } from '@omnia/fx/models';
import { AxiosRequestConfig } from 'axios';
import { OPMService } from '../../fx/models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessLibraryService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;
    @Inject<HttpClientConstructor>(HttpClient, {}) private emptyHttpClient: HttpClient;
    constructor() {
    }

}
