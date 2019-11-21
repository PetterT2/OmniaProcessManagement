import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessTemplateService } from '../services';
import { ProcessTemplate } from '../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTemplateStore extends Store {

    @Inject(ProcessTemplateService) private processTemplateSerivice: ProcessTemplateService;

    private processTemplates = this.state<Array<ProcessTemplate>>([]);

    private ensureLoadProcessTemplatesPromise: Promise<null> = null;

    constructor() {
        super({
            id: "7724d5ef-47bd-4926-8529-9d80b7e96085"
        });
    }

    public getters = {
        processTemplates: () => this.processTemplates.state,
    }

    private privateMutations = {
        addOrUpdateDocumentTemplates: this.mutation((templates: Array<any>, remove?: boolean) => {
            this.processTemplates.mutate(state => {
                let ids = templates.map(t => t.id);

                state.state = state.state.filter(s => ids.indexOf(s.id) == -1);

                if (!remove) {
                    state.state = state.state.concat(templates);

                    state.state.sort((a, b) => {
                        return a.multilingualTitle > b.multilingualTitle ? 1 : -1;
                    });
                }
            })
        })
    }

    public actions = {
        ensureLoadProcessTemplates: this.action(() => {
            if (!this.ensureLoadProcessTemplatesPromise) {
                this.ensureLoadProcessTemplatesPromise = this.processTemplateSerivice.getAllProcessTemplates().then(templates => {
                    this.privateMutations.addOrUpdateDocumentTemplates.commit(templates);
                    return null;
                })
            }

            return this.ensureLoadProcessTemplatesPromise;
        }),
        addOrUpdateProcessTemplate: this.action((processTemplate: ProcessTemplate) => {
            return this.processTemplateSerivice.addOrUpdateProcessTemplate(processTemplate).then((result) => {
                this.privateMutations.addOrUpdateDocumentTemplates.commit([result]);
                return null;
            })
        }),
        deleteProcessTemplate: this.action((processTemplate: ProcessTemplate) => {
            return this.processTemplateSerivice.deleteProcessTemplate(processTemplate.id).then(() => {
                this.privateMutations.addOrUpdateDocumentTemplates.commit([processTemplate], true);
                return null;
            })
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

