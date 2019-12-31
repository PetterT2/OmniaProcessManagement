import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag } from '@omnia/fx/models';
import { OPMService, Process, ImageRef } from '../models';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ImageService {
    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public uploadImage = (process: Process, fileName: string, imageBase64: string) => {
        return new Promise<ImageRef>((resolve, reject) => {
            var params = JSON.stringify(imageBase64);
            this.httpClient.post<IHttpApiOperationResult<ImageRef>>(`/api/images/${process.id}/${fileName}`, params)
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

    public generateImageUrl = (process: Process, imageRef: ImageRef) => {
        let baseUrl = ServiceLocator.getUrl(OPMService.Id);
        return `${baseUrl}/api/images/${process.opmProcessId}/${process.versionType}/${imageRef.fileName}/${imageRef.hash}`;
    }
}