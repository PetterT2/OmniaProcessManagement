import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessService } from '../../fx';
import { Process, ProcessVersionType, Enums } from '../../fx/models';

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
                process.processWorkingStatus = this.processWorkingStatus[process.opmProcessId.toString()] || (process.versionType == ProcessVersionType.Draft ? Enums.WorkflowEnums.ProcessWorkingStatus.Draft : Enums.WorkflowEnums.ProcessWorkingStatus.Published);
            })
        }
    }

    mutations = {
        forceReloadProcessStatus: this.mutation((versionType: ProcessVersionType) => {
        }),
    }

    actions = {
        ensureProcessWorkingStatus: this.action((teamAppId: GuidValue, opmProcessIds: Array<GuidValue>, versionType: ProcessVersionType) => {
            if (versionType == ProcessVersionType.CheckedOut || versionType == ProcessVersionType.Published)
                throw `Not supported`;

            let getProcessWorkingStatus = () => versionType == ProcessVersionType.Draft ?
                this.processService.getDraftProcessWorkingStatus(teamAppId, opmProcessIds) :
                this.processService.getLatestPublishedProcessWorkingStatus(teamAppId, opmProcessIds)

            return getProcessWorkingStatus().then((workingStatus) => {
                opmProcessIds.forEach((opmProcessId, i) => {
                    if (workingStatus[opmProcessId.toString()] != null)
                        this.processWorkingStatus[opmProcessId.toString()] = workingStatus[opmProcessId.toString()];
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

