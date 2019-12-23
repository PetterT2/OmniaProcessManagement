import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, AuthorAndDefaultReaderUpdateInput} from '../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class PermissionService {
  
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public updateOPMPermissions = (updateInput: AuthorAndDefaultReaderUpdateInput) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<void>>('/api/opmpermissions', updateInput).then((response) => {
                if (response.data.success) {
                    resolve();
                }
                else {
                    reject(response.data.errorMessage);
                }
            }).catch(reject);
        })
    }


}