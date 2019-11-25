import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, Utils } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue } from '@omnia/fx/models';
import { ProcessType, OPMService } from '../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessTypeService {

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {

    }

    public getProcessTypeTermSetId = (): Promise<GuidValue> => {

        return new Promise<GuidValue>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<GuidValue>>('/api/processtypes/getprocesstypetermsetid').then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public getAllProcessTypes = (termSetId: GuidValue): Promise<Array<ProcessType>> => {
        return new Promise<Array<ProcessType>>((resolve, reject) => {
            var params = {
                termSetId: termSetId
            }
            this.httpClient.post<IHttpApiOperationResult<Array<ProcessType>>>('/api/processtypes/getallprocesstypes', { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public create = (processType: ProcessType): Promise<ProcessType> => {
        if (processType.id == null) {
            //Id cannot parse from null value server-side
            processType = Utils.clone(processType);
            delete processType.id;
        }

        return new Promise<ProcessType>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<ProcessType>>('/api/processtypes', processType).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public update = (processType: ProcessType): Promise<ProcessType> => {
        return new Promise<ProcessType>((resolve, reject) => {
            this.httpClient.put<IHttpApiOperationResult<ProcessType>>('/api/processtypes', processType).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public remove = (id: GuidValue): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.delete<IHttpApiOperationResult<any>>('/api/processtypes/' + id).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }
}