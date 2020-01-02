import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, Process } from '../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ImageService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public uploadImage = (process: Process, fileName: string, imageBase64: string) => {
        return new Promise<string>((resolve, reject) => {
            var params = JSON.stringify(imageBase64);
            this.httpClient.post<IHttpApiOperationResult<string>>(`/api/images/${process.id}/${fileName}`, params)
                .then(response => {
                    if (response.data.success) {
                        resolve(response.data.data);
                    }
                    else {
                        reject(response.data.errorMessage);
                    }
                })
                .catch(() => {
                    reject();
                });
        })
    }
}