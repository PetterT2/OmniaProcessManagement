import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator } from '@omnia/fx';
import { IHttpApiOperationResult, InstanceLifetimes, GuidValue, MultilingualScopes, MultilingualString } from '@omnia/fx/models';
import { OPMService, ProcessTemplate } from '../fx/models';
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

    processTemplates: Array<ProcessTemplate> = [
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            settings: {
                title: {
                    "en-us": "Business Process",
                    isMultilingualString: true
                },
                shapeDefinations: []
            },
            multilingualTitle: "Business Process",
        },
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            settings: {
                title: {
                    "en-us": "BPMN 2.0",
                    isMultilingualString: true
                },
                shapeDefinations: []
            },
            multilingualTitle: "BPMN 2.0"
        },
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            settings: {
                title: {
                    "en-us": "Project",
                    isMultilingualString: true
                },
                shapeDefinations: []
            },
            multilingualTitle: "Project"
        }
    ]

    public getAllProcessTemplates = () => {
        return new Promise<Array<ProcessTemplate>>((resolve, reject) => {
            //this.httpClient.get<IHttpApiOperationResult<Array<any>>>('/api/processtemplates/getall').then(response => {
            //    if (response.data.success) {
            //        this.generateDocumentTemplatesMultilingualText(response.data.data);
            //        resolve(response.data.data);
            //    }
            //    else reject(response.data.errorMessage)
            //});

            // will be removed
            resolve(this.processTemplates);
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

    private generateDocumentTemplatesMultilingualText = (items: Array<any>) => {
        let languageSetting = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant);

        if (languageSetting) {
            items.forEach(item => {
                let multilingualString: MultilingualString = {} as MultilingualString;
                let languages = Object.keys(item.settings.contents);
                languages.forEach(language => {
                    let foundLanguage = languageSetting.availableLanguages.find(l => l.name == language);
                    if (foundLanguage) {
                        let content = item.settings.contents[foundLanguage.name];
                        multilingualString[foundLanguage.name] = content.title;
                    } else {
                        delete item.settings.contents[language]
                    }
                })

                item.multilingualTitle = this.multilingualStore.getters.stringValue(multilingualString);
            })
        }
    }
}