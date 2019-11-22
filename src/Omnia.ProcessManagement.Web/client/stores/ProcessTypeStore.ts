import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue, Guid } from '@omnia/fx-models';
import { ProcessTemplateService, ProcessTypeService } from '../services';
import { ProcessType } from '../fx/models';
import { TermStore } from '@omnia/fx-sp';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTypeStore extends Store {

    @Inject(ProcessTypeService) private processTypeService: ProcessTypeService;
    @Inject(TermStore) private termStore: TermStore;
    @Inject(MultilingualStore) private multilingualTextsStore: MultilingualStore;

    private processTypeTermSetId: GuidValue = null;
    private processTypes = this.state<Array<ProcessType>>([]);
    private processTypesDict = this.state<{ [processTypeId: string]: ProcessType }>({});

    private ensureRootProcessTypePromise: Promise<null> = null;
    private ensuredProcessTypesPromises: Promise<null> = null;
    private ensuredProcessTypePromises: { [processTypeId: string]: Promise<null> } = {};


    constructor() {
        super({
            id: "1f09d987-df87-4ede-971a-f7e95a18278d"
        });
    }

    public getters = {
        processTypes: () => this.processTypes.state,
        byId: (id: GuidValue): ProcessType => {
            let idKey = id.toString().toLowerCase();
            let documentType = this.processTypesDict.state[idKey];
            return documentType;
        }
    }

    private privateMutations = {
        addOrUpdateProcessTypes: this.mutation((processTypes: Array<ProcessType>, remove?: boolean) => {
            this.processTypesDict.mutate(dictState => {
                processTypes.forEach(processType => {
                    processType.multilingualTitle = this.multilingualTextsStore.getters.stringValue(processType.title);

                    let processTypeId = processType.id.toString().toLowerCase();
                    dictState.state[processTypeId] = remove ? null : processType;
                    if (!this.ensuredProcessTypePromises[processTypeId])
                        this.ensuredProcessTypePromises[processTypeId] = Promise.resolve(null);
                })
            })
            this.processTypes.mutate(processTypes);
        })
    }

    public actions = {
        ensureRootProcessType: this.action(() => {
            if (!this.ensureRootProcessTypePromise) {
                this.ensureRootProcessTypePromise = new Promise<null>((resolve, reject) => {
                    this.processTypeService.getProcessTypeTermSetId().then((guidId) => {
                        if (guidId != Guid.empty) {
                            this.processTypeTermSetId = guidId;
                            this.termStore.actions.ensureTermSet.dispatch(this.processTypeTermSetId).then(() => { resolve(); }).catch(reject);
                        }
                        else {
                            this.ensureRootProcessTypePromise = null;
                            resolve(null);
                        }
                    }).catch(reject)
                })
            }

            return this.ensureRootProcessTypePromise;
        }),
        ensureProcessTypes: this.action(() => {
            if (!this.ensuredProcessTypesPromises) {
                this.ensuredProcessTypesPromises = new Promise<null>((resolve, reject) => {
                    this.processTypeService.getAllProcessTypes(this.processTypeTermSetId).then((processTypes: Array<ProcessType>) => {
                        this.privateMutations.addOrUpdateProcessTypes.commit(processTypes);
                        return null;
                    }).catch(reject)
                })
            }

            return this.ensuredProcessTypesPromises;
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

