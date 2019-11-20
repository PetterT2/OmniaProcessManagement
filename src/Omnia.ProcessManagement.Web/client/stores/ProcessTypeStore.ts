import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessTemplateService } from '../services';
import { ProcessType } from '../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTypeStore extends Store {

    private processTypes = this.state<Array<ProcessType>>([]);

    private ensureLoadProcessTypesPromise: Promise<null> = null;

    constructor() {
        super({
            id: "7cda1364-100d-4b16-81cf-63702828c87e"
        });
    }

    public getters = {
        processTypes: () => this.processTypes.state,
    }

    private privateMutations = {
        //addOrUpdateDocumentTemplates: this.mutation((templates: Array<any>, remove?: boolean) => {
        //    this.processTypes.mutate(state => {
        //        let ids = templates.map(t => t.id);

        //        state.state = state.state.filter(s => ids.indexOf(s.id) == -1);

        //        if (!remove) {
        //            state.state = state.state.concat(templates);

        //            state.state.sort((a, b) => {
        //                return a.multilingualTitle > b.multilingualTitle ? 1 : -1;
        //            });
        //        }
        //    })
        //})
    }

    public actions = {
        //ensureLoadProcessTemplates: this.action(() => {
        //    if (!this.ensureLoadProcessTypesPromise) {
        //        this.ensureLoadProcessTypesPromise = this.processTemplateSerivice.getAllProcessTemplates().then(templates => {
        //            this.privateMutations.addOrUpdateDocumentTemplates.commit(templates);
        //            return null;
        //        })
        //    }

        //    return this.ensureLoadProcessTypesPromise;
        //}),
        //addOrUpdateProcessTemplate: this.action((processTemplate: ProcessTemplate) => {
        //    return this.processTemplateSerivice.addOrUpdateProcessTemplate(processTemplate).then((result) => {
        //        this.privateMutations.addOrUpdateDocumentTemplates.commit([result]);
        //        return null;
        //    })
        //}),
        //deleteProcessTemplate: this.action((processTemplate: any) => {
        //    return this.processTemplateSerivice.deleteProcessTemplate(processTemplate).then(() => {
        //        this.privateMutations.addOrUpdateDocumentTemplates.commit([processTemplate], true);
        //        return null;
        //    })
        //})
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

