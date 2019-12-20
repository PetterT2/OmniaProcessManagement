import { Inject, HttpClientConstructor, HttpClient, Injectable, } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult } from '@omnia/fx/models';
import { OPMService, Setting } from '../models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class SettingsService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public getByKey = (key: string): Promise<Setting> => {
        return new Promise<Setting>((resolve, reject) => {
            let params = {
                key: key
            }
            this.httpClient.get<IHttpApiOperationResult<Setting>>('/api/settings', { params: params }).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public removeByKey = (key: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            let params = {
                key: key
            }
            this.httpClient.delete<IHttpApiOperationResult<void>>('/api/settings', { params: params }).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }

    public addOrUpdate = (setting: Setting): Promise<Setting> => {
        return new Promise<Setting>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Setting>>('/api/settings', setting).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            });
        });
    }
}