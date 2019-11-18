﻿import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';
import { ProcessService } from '../services';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessStore extends Store {

    @Inject(ProcessService) private processService: ProcessService;

    constructor() {
        super({
            id: "2ece393f-00a6-4e22-b380-ec3713d16d15"
        });
    }

    public getters = {

    }

    public actions = {
       
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

