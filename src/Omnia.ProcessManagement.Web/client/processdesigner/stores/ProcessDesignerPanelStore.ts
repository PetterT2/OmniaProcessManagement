﻿import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';
import { DisplayBreakPoint } from '@omnia/wcm/models';

export interface IPanelState {
    show: boolean;
    visible: boolean;
}

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Scoped) }
})
export class ProcessDesignerPanelStore extends Store {
    /**
     * State
     */
    drawingCanvasSettingsPanel: StoreState<IPanelState> = this.state<IPanelState>({
        show: false,
        visible: false
    });
    addShapePanel: StoreState<IPanelState> = this.state<IPanelState>({
        show: false,
        visible: false
    });
   //createLinkPanel: StoreState<IPanelState> = this.state<IPanelState>({
   //     show: false,
   //     visible: false
   // });

    constructor() {
        super({
            id: "63802714-efc6-4bae-833a-f84943a73cc5"
        });
    }

    onActivated() {
    }

    onDisposing() {

    }

    /**
     * Toggle the setting panel between show or hide
     * @param state
     * @param show
     */
    mutations = {
        hideAllPanels: this.mutation(() => {
            this.mutations.hideNoneSpinnedPanels.commit();
            //todo: to hide the spinned panel, put it here!
        }),
        hideNoneSpinnedPanels: this.mutation(() => {
            this.mutations.toggleDrawingCanvasSettingsPanel.commit(false);
        }),
                
        toggleDrawingCanvasSettingsPanel: this.mutation((show: boolean) => {
            this.drawingCanvasSettingsPanel.mutate({
                show: show,
                visible: show
            });
        }),
        toggleAddShapePanel: this.mutation((show: boolean) => {
            this.addShapePanel.mutate({
                show: show,
                visible: show
            });
        })
        //createLinkPanel: this.mutation((show: boolean) => {
        //    this.createLinkPanel.mutate({
        //        show: show,
        //        visible: show
        //    });
        //})
    }
}

