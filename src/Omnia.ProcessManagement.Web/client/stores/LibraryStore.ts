import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { SharePointContext } from '@omnia/fx-sp';
import { Enums, Process, ProcessVersionType } from '../fx/models';
import { ProcessService } from '../fx';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class LibraryStore extends Store {
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(ProcessService) private processService: ProcessService;

    private processWorkingStatus: { [key: string]: Enums.WorkflowEnums.ProcessWorkingStatus } = {};

    constructor() {
        super({
            id: "013c6edd-9c34-41ca-9e2b-3d369c2dfcdc"
        });
    }

    getters = {
        processWorkingStatus: (processes: Array<Process>) => {
            processes.forEach(process => {
                process.processWorkingStatus = this.processWorkingStatus[process.id.toString()] || (process.versionType == ProcessVersionType.Draft ? Enums.WorkflowEnums.ProcessWorkingStatus.Draft : Enums.WorkflowEnums.ProcessWorkingStatus.Published);
            })
        }
    }

    mutations = {
        forceReloadProcessStatus: this.mutation(() => {
        }),
    }

    actions = {
        ensureProcessWorkingStatus: this.action((siteId: GuidValue, webId: GuidValue, processIds: Array<GuidValue>) => {
            return this.processService.getProcessWorkingStatus(siteId, webId, processIds)
                .then((workingStatus: Array<Enums.WorkflowEnums.ProcessWorkingStatus>) => {
                    processIds.forEach((id, i) => {
                        this.processWorkingStatus[id.toString()] = workingStatus[i];
                    });
                    return null;
                });
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

