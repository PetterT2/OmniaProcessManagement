import { Store } from '@omnia/fx/store';
import { Injectable, Inject, Topics } from '@omnia/fx';
import { FormValidator, VueComponentBase } from '@omnia/fx/ux';
import { InstanceLifetimes, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { ProcessDesignerSettingsStore } from './ProcessDesignerSettingsStore';
import { ProcessDesignerTabStore } from './ProcessDesignerTabStore';
import { CurrentProcessStore } from '../../fx';
import { IProcessDesignerItem, ActionItem, DisplayModes } from '../../models/processdesigner';
import { IProcessDesignerItemFactory } from '../../processdesigner/designeritems';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})

export class ProcessDesignerStore extends Store {
    //@Inject(EditorCanvasStore) canvas: EditorCanvasStore;
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

    notificationMessage = this.state<{ message: string, show: boolean, timeout: number, customRenderer: string }>({
        message: null,
        show: false,
        timeout: 0,
        customRenderer: null
    });

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
        }
    }

    /**
     * Adds an item to the layout.
     */
    mutations = {
        setEditorLoadingState: this.mutation((isLoading: boolean) => {
            this.loadingInProgress.mutate((loadingProgress) => {
                loadingProgress.state = isLoading;
            })
        }),
        changeDisplayMode: this.mutation((displayMode: DisplayModes) => {
            this.settings.displayMode.mutate(displayMode);
            //this.canvas.mutations.setSettingPanelVisibilityForDisplayMode.commit(displayMode);//todo
            //Topics.onPageEditModeChanged.publish({//todo
            //    editMode: true,
            //    contentEditing: displayMode === DisplayModes.contentEditing
            //});

        }),
        registerTemporaryActionButtons: this.mutation((buttons: Array<ActionItem>) => {
            this.temporaryActionButtons.mutate(buttons);
        }),
        removeTemporaryActionButtons: this.mutation((buttons: Array<ActionItem>) => {
            if (this.temporaryActionButtons.state === buttons) {
                this.temporaryActionButtons.mutate([]);
            }
        }),
        //showMessage: this.mutation((message: NotificationMessage) => {
        //    let timeOut = (message.timeout && message.timeout !== 0) ? message.timeout : 6000;
        //    this.notificationMessage.mutate((notificationMessage) => {
        //        notificationMessage.state.message = message.message;
        //        notificationMessage.state.show = true;
        //        notificationMessage.state.timeout = timeOut;
        //        notificationMessage.state.customRenderer = message.customElementName;
        //    });
        //}),       
        setActiveItemInDesigner: this.mutation((item: IProcessDesignerItem) => {
            this.mutations.setEditorLoadingState.commit(true);
            //this.savePageStateManager.stop();//todo check thisssssssssssssssss
            this.previousItem.mutate(this.item.state);
            this.item.mutate(item);
            this.settings.itemIsCheckOut.mutate(false);
            this.tabs.currentTabs.mutate(item.tabs);
            this.tabs.mutations.setDefaultSelectedTab.commit();
            //this.canvas.mutations.hidePanelsWhenNewEditorItem.commit();
            //this.canvas.mutations.setSettingPanelVisibilityForDisplayMode.commit(this.settings.editorDisplayMode.state);
            this.errorTabIndex.mutate(-1);

            //Topics.onPageEditModeChanged.publish({
            //    editMode: false,
            //    contentEditing: false
            //});
            //if ((item as IPageEditorItem).pageVersion && this.idForAutoCheckout.state === (item as IPageEditorItem).pageVersion.id) {
            //    (item as IPageEditorItem).onCheckOut();
            //}
            //this.idForAutoCheckout.mutate(null);
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
    }

    actions = {
        setEditorToCheckedOutMode: this.action(() => {
            return new Promise<null>((resolve, reject) => {
                this.settings.itemIsCheckOut.mutate(true);
                this.settings.displayMode.mutate(DisplayModes.contentEditing);
               
                //Topics.onPageEditModeChanged.publish({
                //    editMode: true,
                //    contentEditing: this.settings.editorDisplayMode.state === EditorDisplayModes.contentEditing
                //});
                this.item.mutate(this.item.state);
                //this.canvas.mutations.hideAllPanels.commit();//todo
                //this.savePageStateManager.start();
                this.mutations.setEditorLoadingState.commit(false);
                resolve();
            })
        }),
        //setEditorToReadMode: this.action((leaveEditorOpen?: boolean) => {
        //    let showEditor = false;
        //    if (leaveEditorOpen) {
        //        showEditor = true;
        //    }
        //    else if (this.settings.showContentNavigation.state) {
        //        showEditor = true;
        //    }
        //    this.settings.itemIsCheckOut.mutate(false);
        //    this.canvas.mutations.hideAllPanels.commit();
        //    return new Promise<null>((resolve, reject) => {
        //        /*Set the state of the blocks
        //         * set page to display mode before set editor to prevent blocks re-create with edit mode flashed got exception such as content block .
        //         */
        //        Topics.onPageEditModeChanged.publish({
        //            editMode: false,
        //            contentEditing: false
        //        });
        //        this.actions.showEditor.dispatch(showEditor).then(() => {
        //            /**
        //             * If not content navigation is open the page should not be in content navigation mode after update.
        //             * Otherwise it is closed
        //            */
        //            this.canvas.mutations.removeSelectedLayoutItem.commit();
        //            ///*Set the state of the blocks*/
        //            //Topics.onPageEditModeChanged.publish({
        //            //    editMode: false,
        //            //    contentEditing: false
        //            //});
        //            this.savePageStateManager.stop();
        //            resolve();
        //            this.mutations.setEditorLoadingState.commit(false);
        //        }).catch(reject);
        //    });
        //}),

        showDesigner: this.action((isShowDesigner: boolean) => {
            return new Promise<null>((resolve, reject) => {
                if (!this.currentProcessStore.getters.referenceData()) {
                    this.editmode.mutate(isShowDesigner);
                    //PublishingAppTopics.onShowEditorModeChanged.publish({ edit: showEditor });//todo
                }
                //this.currentPageStore.actions.setEditMode.dispatch(showEditor).then(() => {//todo => check how to load the draft version for edit
                //    this.editmode.mutate(isShowDesigner);
                //    //PublishingAppTopics.onShowEditorModeChanged.publish({ edit: showEditor });//todo
                //    resolve();
                //});
                this.editmode.mutate(isShowDesigner);
                resolve();
            });
        }),
        editCurrentProcess: this.action((processDesignerItemFactory: IProcessDesignerItemFactory, displayMode?: DisplayModes) => {
            return new Promise<null>((resolve, reject) => {

                let defaultShowContentNavigation: boolean = false;
                if (this.editmode.state) {
                    defaultShowContentNavigation = this.settings.showContentNavigation.state;
                }


                this.actions.showDesigner.dispatch(true).then(() => {
                    let designerItem: IProcessDesignerItem = processDesignerItemFactory.createDesignerItem() as IProcessDesignerItem;
                    this.mutations.setActiveItemInDesigner.commit(designerItem);

                   //todo: Handle checkedout checking later
                    this.settings.showContentNavigation.mutate(true);
                    this.mutations.setEditorLoadingState.commit(false);
                    resolve();
                });
            })
        })
    }
}