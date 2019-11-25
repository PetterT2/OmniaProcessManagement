import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, GuidValue, MultilingualScopes, MultilingualString } from '@omnia/fx/models';
import { OPMService, ProcessTemplate } from '../models';
import { MultilingualStore } from '@omnia/fx/store';
import { AxiosRequestConfig } from 'axios';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessTemplateService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public getAllProcessTemplates = () => {
        return new Promise<Array<ProcessTemplate>>((resolve, reject) => {
            this.httpClient.get<IHttpApiOperationResult<Array<any>>>('/api/processtemplates/all').then(response => {
                if (response.data.success) {
                    this.generateDocumentTemplatesMultilingualText(response.data.data);
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public addOrUpdateProcessTemplate = (processTemplate: ProcessTemplate) => {
        return new Promise<ProcessTemplate>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<ProcessTemplate>>('/api/processtemplates/addorupdate', processTemplate).then(response => {
                if (response.data.success) {
                    this.generateDocumentTemplatesMultilingualText([response.data.data]);
                    resolve(response.data.data);
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    public deleteProcessTemplate = (id: GuidValue) => {
        return new Promise<void>((resolve, reject) => {
            this.httpClient.delete<IHttpApiOperationResult<void>>('/api/processtemplates/' + id).then(response => {
                if (response.data.success) {
                    resolve();
                }
                else reject(response.data.errorMessage)
            });
        });
    }

    private generateDocumentTemplatesMultilingualText = (items: Array<ProcessTemplate>) => {
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