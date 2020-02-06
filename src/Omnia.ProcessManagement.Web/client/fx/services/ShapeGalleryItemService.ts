﻿import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, GuidValue, MultilingualScopes, MultilingualString } from '@omnia/fx/models';
import { OPMService, ShapeGalleryItem } from '../models';
import { MultilingualStore } from '@omnia/fx/store';
import { AxiosRequestConfig } from 'axios';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ShapeGalleryItemService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public getAllShapeGalleryItems = () => {
        return new Promise<Array<ShapeGalleryItem>>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Array<any>>>('/api/shapegalleryitem/all').then(response => {
                if (response.data.success) {
                    this.generateDocumentTemplatesMultilingualText(response.data.data);
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public getShapeGalleryItemById = (id: GuidValue) => {
        return new Promise<ShapeGalleryItem>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<ShapeGalleryItem>>('/api/shapegalleryitem/' + id).then(response => {
                if (response.data.success) {
                    this.generateDocumentTemplatesMultilingualText([response.data.data]);
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public addOrUpdateShapeGalleryItem = (processTemplate: ShapeGalleryItem) => {
        return new Promise<ShapeGalleryItem>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<ShapeGalleryItem>>('/api/shapegalleryitem/addorupdate', processTemplate).then(response => {
                if (response.data.success) {
                    this.generateDocumentTemplatesMultilingualText([response.data.data]);
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public deleteShapeGalleryItem = (id: GuidValue) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.delete<IHttpApiOperationResult<void>>('/api/shapegalleryitem/' + id).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    private generateDocumentTemplatesMultilingualText = (items: Array<ShapeGalleryItem>) => {
        let languageSetting = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant);

        if (languageSetting) {
            items.forEach(item => {
                let multilingualString: MultilingualString = {} as MultilingualString;
                let languages = Object.keys(item.settings.title);
                languages.forEach(language => {
                    let foundLanguage = languageSetting.availableLanguages.find(l => l.name == language);
                    if (foundLanguage) {
                        let content = item.settings.title[foundLanguage.name];
                        multilingualString[foundLanguage.name] = content;
                    } else {
                        delete item.settings.title[language]
                    }
                })

                item.multilingualTitle = this.multilingualStore.getters.stringValue(multilingualString);
            })
        }
    }
}