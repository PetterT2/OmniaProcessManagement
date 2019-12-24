import { Store } from '@omnia/fx/store';
import { Injectable, Inject, Topics, Utils } from '@omnia/fx';
import { FormValidator, VueComponentBase } from '@omnia/fx/ux';
import { InstanceLifetimes, IMessageBusSubscriptionHandler, GuidValue, MultilingualString, Guid } from '@omnia/fx-models';
import { ProcessDesignerSettingsStore } from './ProcessDesignerSettingsStore';
import { ProcessDesignerTabStore } from './ProcessDesignerTabStore';
import { CurrentProcessStore } from '../../fx';
import { IProcessDesignerItem, ActionItem, DisplayModes, DrawingShapeOptions } from '../../models/processdesigner';
import { IProcessDesignerItemFactory } from '../../processdesigner/designeritems';
import { ProcessDesignerPanelStore } from './ProcessDesignerPanelStore';
import { DrawingShape, ShapeDefinition } from '../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Scoped) }
})

export class ProcessDesignerStore extends Store {
    @Inject(ProcessDesignerPanelStore) panels: ProcessDesignerPanelStore;
    @Inject(ProcessDesignerSettingsStore) settings: ProcessDesignerSettingsStore;
    @Inject(ProcessDesignerTabStore) tabs: ProcessDesignerTabStore;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

//    private savePageStateManager: SavePageStateManager = new SavePageStateManager();//todo: important!

    /**
     * State
     */
    idForAutoCheckout = this.state<number>(null);
    item = this.state<IProcessDesignerItem>(null);
    previousItem = this.state<IProcessDesignerItem>(null);
    editmode = this.state<boolean>(false);
    loadingInProgress = this.state<boolean>(true);
    temporaryActionButtons = this.state<Array<ActionItem>>([]);
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    errorTabIndex = this.state<number>(-1);
    formValidator: FormValidator = null;
    recentShapeSelections = this.state<Array<ShapeDefinition>>([]);
    selectedShape = this.state<DrawingShape>(null);
    private hasDataChanged = this.state<boolean>(null);
    private contentChangedTimewatchId: string = "processstep_contentchanged_" + Utils.generateGuid();
   
    constructor() {
        super({ id: "0c263d6c-4ab2-4345-b9f3-8b3919de1b5f" });
    }

    onActivated() {
    }

    onDisposing() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }
        

    getters = {
        isEditMode: (): boolean => {
            return this.editmode.state;
        },
        hasDataChanged: (): boolean => {
            return this.hasDataChanged.state;
        },
        shapeToEditSettings: (): DrawingShape => {
            return this.selectedShape.state;
        }
    }

    /**
     * Adds an item to the layout.
     */
    mutations = {
        setHasDataChangedState: this.mutation((dataChanged: boolean) => {
            this.hasDataChanged.mutate((hasDataChanged) => {
                hasDataChanged.state = dataChanged;
            })
        }),
        setEditorLoadingState: this.mutation((isLoading: boolean) => {
            this.loadingInProgress.mutate((loadingProgress) => {
                loadingProgress.state = isLoading;
            })
        }),
        changeDisplayMode: this.mutation((displayMode: DisplayModes) => {
            this.settings.displayMode.mutate(displayMode);
        }),
        registerTemporaryActionButtons: this.mutation((buttons: Array<ActionItem>) => {
            this.temporaryActionButtons.mutate(buttons);
        }),
        removeTemporaryActionButtons: this.mutation((buttons: Array<ActionItem>) => {
            if (this.temporaryActionButtons.state === buttons) {
                this.temporaryActionButtons.mutate([]);
            }
        }),
        setActiveItemInDesigner: this.mutation((item: IProcessDesignerItem) => {
            this.mutations.setEditorLoadingState.commit(true);
            //this.savePageStateManager.stop();//todo check this
            this.previousItem.mutate(this.item.state);
            this.item.mutate(item);
            this.settings.itemIsCheckOut.mutate(false);
            this.tabs.currentTabs.mutate(item.tabs);
            this.tabs.mutations.setDefaultSelectedTab.commit();
            this.panels.mutations.hideNoneSpinnedPanels.commit();
            this.errorTabIndex.mutate(-1);
            item.onActivation();
        }),
        stopSavePageStateManager: this.mutation(() => {
            return new Promise<null>((resolve, reject) => {
                //this.savePageStateManager.stop();//todo
            });
        }),
        initFormValidator: this.mutation((el: VueComponentBase<{}, {}, {}>) => {
            if (this.formValidator != null) {
                this.formValidator.clearValidation();
            }
            this.formValidator = new FormValidator(el);
        }),
        addShapeToDrawing: this.mutation((drawingShapeOption: DrawingShapeOptions) => {

        }),
        updateDrawingShape: this.mutation((drawingShapeOption: DrawingShapeOptions) => {

        }),
        setSelectedShapeToEdit: this.mutation((selectedShape: DrawingShape) => {
            this.selectedShape.mutate(selectedShape);
        })
    }

    actions = {
        setEditorToCheckedOutMode: this.action(() => {
            return new Promise<null>((resolve, reject) => {
                this.settings.itemIsCheckOut.mutate(true);
                this.settings.displayMode.mutate(DisplayModes.contentEditing);

                this.item.mutate(this.item.state);
                this.panels.mutations.hideAllPanels.commit();
                //this.savePageStateManager.start();//todo
                this.mutations.setEditorLoadingState.commit(false);
                resolve();
            })
        }),
        setDesignerToReadMode: this.action((leaveDesignerOpen?: boolean) => {
            let showDesigner = false;
            if (leaveDesignerOpen) {
                showDesigner = true;
            }
            else if (this.settings.showContentNavigation.state) {
                showDesigner = true;
            }
            this.settings.itemIsCheckOut.mutate(false);
            this.panels.mutations.hideAllPanels.commit();
            return new Promise<null>((resolve, reject) => {
                this.actions.showDesigner.dispatch(showDesigner).then(() => {
                    //this.savePageStateManager.stop();//todo
                    resolve();
                    this.mutations.setEditorLoadingState.commit(false);
                }).catch(reject);
            });
        }),
        showDesigner: this.action((isShowDesigner: boolean) => {
            return new Promise<null>((resolve, reject) => {
                if (!this.currentProcessStore.getters.referenceData()) {
                    this.editmode.mutate(isShowDesigner);
                    //PublishingAppTopics.onShowEditorModeChanged.publish({ edit: showEditor });//todo
                }
                this.editmode.mutate(isShowDesigner);
                resolve();
            });
        }),
        editCurrentProcess: this.action((processDesignerItemFactory: IProcessDesignerItemFactory, displayMode?: DisplayModes) => {
            return new Promise<null>((resolve, reject) => {
                let currentProcess = this.currentProcessStore.getters.referenceData();
                if (!currentProcess.current.processData.canvasDefinition) {
                    currentProcess.current.processData.canvasDefinition = this.initDefaultCanvasDefinition();                    
                }

                let defaultShowContentNavigation: boolean = false;
                if (this.editmode.state) {
                    defaultShowContentNavigation =  this.settings.showContentNavigation.state;
                }

                this.actions.showDesigner.dispatch(true).then(() => {
                    let designerItem: IProcessDesignerItem = processDesignerItemFactory.createDesignerItem() as IProcessDesignerItem;
                    this.mutations.setActiveItemInDesigner.commit(designerItem);

                    this.settings.showContentNavigation.mutate(true);
                    this.mutations.setEditorLoadingState.commit(false);
                    resolve();
                });
            })
        }),
        addRecentShapeDefinitionSelection: this.action((shapeDefinition: ShapeDefinition) => {
            return new Promise<any>((resolve, reject) => {
                var shapeDefinitions = this.recentShapeSelections.state.filter((item) => {
                    return item.id != shapeDefinition.id;
                });
                var recentShapeDefinitions = [];
                recentShapeDefinitions.push(shapeDefinition);
                recentShapeDefinitions = recentShapeDefinitions.concat(shapeDefinitions);
                if (recentShapeDefinitions.length > 5) {
                    recentShapeDefinitions = recentShapeDefinitions.slice(0, 5);
                }
                this.recentShapeSelections.mutate(recentShapeDefinitions);
            });
        }),
        clearRecentShapeDefinitionSelection: this.action(() => {
            return new Promise<any>((resolve, reject) => {
                this.recentShapeSelections.mutate([]);
            });
        }),
        saveState: this.action((timewatch: boolean = true, refreshContentNavigation?: boolean): Promise<null> => {
            return new Promise<null>((resolve, reject) => {
                let timewatchDuration = timewatch ? 2000 : 0;
                this.mutations.setHasDataChangedState.commit(true);
                Utils.timewatch(this.contentChangedTimewatchId, () => {
                    this.currentProcessStore.actions.saveState.dispatch().then(() => {
                        this.mutations.setHasDataChangedState.commit(false);
                        resolve();
                    }).catch(reject);
                }, timewatchDuration);
            })
        })
    }

    private initDefaultCanvasDefinition() {
        return {
            drawingShapes: [],
            width: 700,
            height: 500,
            gridX: 20,
            gridY: 20,
            imageBackgroundUrl: ''
        };

    }
}