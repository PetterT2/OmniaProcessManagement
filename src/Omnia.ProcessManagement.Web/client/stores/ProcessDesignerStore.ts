import { Store } from '@omnia/fx/store';
import { Injectable, Inject, Topics, DependencyContainer } from '@omnia/fx';
import { FormValidator, VueComponentBase } from '@omnia/fx/ux';
import { InstanceLifetimes } from '@omnia/fx-models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})

export class ProcessDesignerStore extends Store {
    protected onActivated() {
        throw new Error("Method not implemented.");
    }    protected onDisposing() {
        throw new Error("Method not implemented.");
    }

   
}