import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessService } from '../../fx';
import { Process, ProcessVersionType, Enums, ProcessWorkingStatus } from '../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class LibraryStore extends Store {
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(ProcessService) private processService: ProcessService;

    constructor() {
        super({
            id: "013c6edd-9c34-41ca-9e2b-3d369c2dfcdc"
        });
    }

    getters = {

    }

    mutations = {
        forceReloadProcessStatus: this.mutation((versionType: ProcessVersionType) => {
        })
    }

    
    protected onActivated() {

    }
    protected onDisposing() {

    }
}

