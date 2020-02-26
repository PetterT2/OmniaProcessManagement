import { Inject, HttpClientConstructor, HttpClient, Injectable, ServiceLocator, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, IHttpApiOperationResult, GuidValue, LanguageTag, RollupSetting } from '@omnia/fx/models';
import { OPMService, ProcessActionModel, Process, ProcessVersionType, ProcessStep, Enums, ProcessData, IdDict, ProcessWorkingStatus, RollupProcessResult, LightProcess } from '../models';
import { MultilingualStore } from '@omnia/fx/store';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class ProcessRollupService {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(OmniaContext) private omniaContext: OmniaContext;

    @Inject<HttpClientConstructor>(HttpClient, {
        configPromise: HttpClient.createOmniaServiceRequestConfig(OPMService.Id.toString())
    }) private httpClient: HttpClient;

    constructor() {
    }

    public queryProcesses = (query: RollupSetting) => {
        return new Promise<RollupProcessResult>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<RollupProcessResult>>('/api/processrollup/queryrollup', query).then(response => {
                if (response.data.success) {
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            }).catch(reject);
        });
    }

    public queryProcessesWithoutPermission = (query: RollupSetting) => {
        return new Promise<Array<LightProcess>>((resolve, reject) => {
            this.httpClient.post<IHttpApiOperationResult<Array<LightProcess>>>('/api/processrollup/queryrollupwithoutpermission', query).then(response => {
                if (response.data.success) {
                    this.generateClientSideData(response.data.data);
                    resolve(response.data.data);
                }
                else
                    reject(response.data.errorMessage);
            }).catch(reject);
        });
    }

    private generateClientSideData = (processes: Array<LightProcess>, ) => {
        for (let process of processes) {
            process.multilingualTitle = this.multilingualStore.getters.stringValue(process.title);
        }
    }
}