import { Store, MultilingualStore } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ShapeGalleryItemService } from '../services';
import { ShapeTemplate } from '../models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ShapeGalleryItemStore extends Store {

    @Inject(ShapeGalleryItemService) private shapeGalleryItemService: ShapeGalleryItemService;

    private shapeGalleryItems = this.state<Array<ShapeTemplate>>([]);

    private ensureLoadShapeGalleryItemsPromise: Promise<null> = null;

    constructor() {
        super({
            id: "bab4d965-26f4-45f1-879d-b3dcadb8a64b"
        });
    }

    public getters = {
        shapeGalleryItems: () => this.shapeGalleryItems.state,
    }

    private privateMutations = {
        addOrUpdateShapeGalleryItems: this.mutation((templates: Array<ShapeTemplate>, remove?: boolean) => {
            this.shapeGalleryItems.mutate(state => {
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
        addOrUpdateShapeGalleryItem: this.mutation((shapeDeclaration: ShapeTemplate) => {
            var existedTemplateIndex = this.shapeGalleryItems.state.findIndex((item) =>
                item.id == shapeDeclaration.id);
            if (existedTemplateIndex >= 0) {
                this.shapeGalleryItems.state[existedTemplateIndex] = shapeDeclaration;
            }
            else {
                this.shapeGalleryItems.state.push(shapeDeclaration);
            }
        })
    }

    public actions = {
        ensureLoadShapeGalleryItems: this.action(() => {
            if (!this.ensureLoadShapeGalleryItemsPromise) {
                this.ensureLoadShapeGalleryItemsPromise = this.shapeGalleryItemService.getAllShapeGalleryItems().then(shapeGalleryItems => {
                    this.privateMutations.addOrUpdateShapeGalleryItems.commit(shapeGalleryItems);
                    return null;
                })
            }

            return this.ensureLoadShapeGalleryItemsPromise;
        }),
        ensureLoadShapeGalleryItem: this.action((shapeDeclarationId: GuidValue, alwaysGetLatest: boolean = false) => {
            return new Promise<ShapeTemplate>((resolve, reject) => {
                let result: ShapeTemplate = null;
                if (!alwaysGetLatest) {
                    if (this.shapeGalleryItems.state) {
                        result = this.shapeGalleryItems.state.find(item => item.id == shapeDeclarationId);
                    }
                }
                if (!result) {
                    this.shapeGalleryItemService.getShapeGalleryItemById(shapeDeclarationId).then((shapeGalleryItems) => {
                        this.privateMutations.addOrUpdateShapeGalleryItem.commit(shapeGalleryItems);
                        resolve(shapeGalleryItems);
                    }).catch(reject);
                }
                else {
                    resolve(result);
                }
            });
        }),
        addOrUpdateShapeGalleryItem: this.action((shapeDeclaration: ShapeTemplate) => {
            return this.shapeGalleryItemService.addOrUpdateShapeGalleryItem(shapeDeclaration).then((result) => {
                this.privateMutations.addOrUpdateShapeGalleryItems.commit([result]);
                return result;
            })
        }),
        addImage: this.action((shapeGalleryItemId: string, fileName: string, image64: string) => {
            return this.shapeGalleryItemService.addImage(shapeGalleryItemId, fileName, image64).then((result) => {
                return result;
            })
        }),
        deleteShapeGalleryItem: this.action((shapeDeclaration: ShapeTemplate) => {
            return this.shapeGalleryItemService.deleteShapeGalleryItem(shapeDeclaration.id).then(() => {
                this.privateMutations.addOrUpdateShapeGalleryItems.commit([shapeDeclaration], true);
                return null;
            })
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

