import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import {  } from '../../../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTypeJourneyStore extends Store {

    constructor() {
        super({
            id: "2f4249d0-b1cd-460a-98d5-cd0d94e604d9"
        });
    }

    getters = {
        
    }

    mutations = {
        
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

