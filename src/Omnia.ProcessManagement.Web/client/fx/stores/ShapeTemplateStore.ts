import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ShapeTemplateService } from '../services';
import { ShapeTemplate } from '../models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ShapeTemplateStore extends Store {

    @Inject(ShapeTemplateService) private shapeTemplateService: ShapeTemplateService;

    private shapeTemplates = this.state<Array<ShapeTemplate>>([]);

    private ensureLoadShapeTemplatesPromise: Promise<null> = null;

    constructor() {
        super({
            id: "bab4d965-26f4-45f1-879d-b3dcadb8a64b"
        });
    }

    public getters = {
        shapeTemplates: () => this.shapeTemplates.state,
    }

    private privateMutations = {
        addOrUpdateShapeTemplates: this.mutation((templates: Array<ShapeTemplate>, remove?: boolean) => {
            this.shapeTemplates.mutate(state => {
                let ids = templates.map(t => t.id);

                state.state = state.state.filter(s => ids.indexOf(s.id) == -1);

                if (!remove) {
                    state.state = state.state.concat(templates);

                    state.state.sort((a, b) => {
                        return a.multilingualTitle > b.multilingualTitle ? 1 : -1;
                    });
                }
            })
        }),
        addOrUpdateShapeTemplate: this.mutation((shapeTemplate: ShapeTemplate) => {
            var existedTemplateIndex = this.shapeTemplates.state.findIndex((item) =>
                item.id == shapeTemplate.id);
            if (existedTemplateIndex >= 0) {
                this.shapeTemplates.state[existedTemplateIndex] = shapeTemplate;
            }
            else {
                this.shapeTemplates.state.push(shapeTemplate);
            }
        })
    }

    public actions = {
        ensureLoadShapeTemplates: this.action(() => {
            if (!this.ensureLoadShapeTemplatesPromise) {
                this.ensureLoadShapeTemplatesPromise = this.shapeTemplateService.getAllShapeTemplates().then(shapeGalleryItems => {
                    this.privateMutations.addOrUpdateShapeTemplates.commit(shapeGalleryItems);
                    return null;
                })
            }

            return this.ensureLoadShapeTemplatesPromise;
        }),
        ensureLoadShapeTemplate: this.action((shapeTemplateId: GuidValue, alwaysGetLatest: boolean = false) => {
            return new Promise<ShapeTemplate>((resolve, reject) => {
                let result: ShapeTemplate = null;
                if (!alwaysGetLatest) {
                    if (this.shapeTemplates.state) {
                        result = this.shapeTemplates.state.find(item => item.id == shapeTemplateId);
                    }
                }
                if (!result) {
                    this.shapeTemplateService.getShapeTemplateById(shapeTemplateId).then((shapeGalleryItems) => {
                        this.privateMutations.addOrUpdateShapeTemplate.commit(shapeGalleryItems);
                        resolve(shapeGalleryItems);
                    }).catch(reject);
                }
                else {
                    resolve(result);
                }
            });
        }),
        addOrUpdateShapeTemplate: this.action((shapeTemplate: ShapeTemplate) => {
            return this.shapeTemplateService.addOrUpdateShapeTemplateItem(shapeTemplate).then((result) => {
                this.privateMutations.addOrUpdateShapeTemplates.commit([result]);
                return result;
            })
        }),
        addImage: this.action((shapeGalleryItemId: string, fileName: string, image64: string) => {
            return this.shapeTemplateService.addImage(shapeGalleryItemId, fileName, image64).then((result) => {
                return result;
            })
        }),
        deleteShapeGalleryItem: this.action((shapeTemplate: ShapeTemplate) => {
            return this.shapeTemplateService.deleteShapeTemplate(shapeTemplate.id).then(() => {
                this.privateMutations.addOrUpdateShapeTemplates.commit([shapeTemplate], true);
                return null;
            })
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

