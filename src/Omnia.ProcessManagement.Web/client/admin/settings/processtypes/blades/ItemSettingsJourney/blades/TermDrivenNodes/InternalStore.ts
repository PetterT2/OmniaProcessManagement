import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { TermBase } from '@omnia/fx-sp';

/**
 * This is an internal store to sharing selecting node state betweens nodes
 * 
 * */
@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class InternalStore extends Store {
    constructor() {
        super({
            id: "040ed498-c9f1-48c2-b774-9212b205567f"
        });
    }

    private selectingTerm = this.state<TermBase>(null);

    getters = {
        selectingTerm: () => {
            return this.selectingTerm.state;
        }
    }

    mutations = {
        setSelectingTerm: this.mutation((term: TermBase) => {
            this.selectingTerm.mutate(term);
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

