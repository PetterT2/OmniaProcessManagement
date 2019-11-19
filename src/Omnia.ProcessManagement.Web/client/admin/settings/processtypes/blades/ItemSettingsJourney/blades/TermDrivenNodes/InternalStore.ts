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
            id: "C65645B5-B697-4070-B34C-08085631FF7A"
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

