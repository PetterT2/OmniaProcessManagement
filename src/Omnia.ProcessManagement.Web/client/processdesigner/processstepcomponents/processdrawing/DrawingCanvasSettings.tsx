import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, MediaPickerProvider, MediaPickerProviderMediaTypes, DialogPositions, MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';
import { DrawingCanvasSettingsStyles } from '../../../fx/models';
import { TabRenderer } from '../../core';
import { ProcessDesignerStore } from '../../stores';
import { CurrentProcessStore } from '../../../fx';
import { CanvasDefinition } from '../../../fx/models';
import './DrawingCanvasSettings.css';
import { classes } from 'typestyle';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { InternalOPMTopics } from '../../../fx/messaging/InternalOPMTopics';

export interface DrawingCanvasSettingsProps {
}

@Component
export class DrawingCanvasSettingsComponent extends VueComponentBase<DrawingCanvasSettingsProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private isOpenMediaPicker: boolean = false;
    canvasSettingsStyles = StyleFlow.use(DrawingCanvasSettingsStyles);

    created() {
        this.init();
    }

    init() {

    }

    get editingCanvasDefinition() {
        let result: CanvasDefinition = this.currentProcessStore.getters.referenceData().current.processData.canvasDefinition;
        return result;
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleDrawingCanvasSettingsPanel.commit(false);
    }

    private onImageSaved(imageUrl: string) {
        this.editingCanvasDefinition.backgroundImageUrl = imageUrl;
        this.onSettingsChanged();
        this.$forceUpdate();
    }

    private closeImageDialog() {
        this.isOpenMediaPicker = false;
    }

    private openImageDialog() {
        this.isOpenMediaPicker = true;
    }

    private removeBackgroundImage() {
        this.editingCanvasDefinition.backgroundImageUrl = null;
        this.onSettingsChanged();
        this.$forceUpdate();
    }

    renderSettings(h) {
        return <v-container>
            <v-row>
                <v-col>
                    <div>{this.pdLoc.BackgroundImage}</div>
                    {
                        !Utils.isNullOrEmpty(this.editingCanvasDefinition.backgroundImageUrl) ?
                            <div>
                                <div class="my-3">
                                    <v-btn fab x-small class="mr-2" onClick={this.openImageDialog}>
                                        <v-icon>edit</v-icon>
                                    </v-btn>
                                    <v-btn fab x-small onClick={this.removeBackgroundImage}>
                                        <v-icon>delete</v-icon>
                                    </v-btn>
                                </div>
                                <img class={this.canvasSettingsStyles.image} src={this.editingCanvasDefinition.backgroundImageUrl}></img>

                            </div>
                            :
                            <a onClick={this.openImageDialog} href="javascript:void(0)">{this.pdLoc.AddImage}</a>
                    }
                    {this.isOpenMediaPicker && <opm-media-picker onImageSaved={this.onImageSaved} onClosed={this.closeImageDialog}></opm-media-picker>}
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <div>{this.pdLoc.Size}</div>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.editingCanvasDefinition.width} label={this.pdLoc.Width} type="number" max="2000" suffix="px" onChange={this.onSettingsChanged}></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.editingCanvasDefinition.height} label={this.pdLoc.Height} type="number" suffix="px" onChange={this.onSettingsChanged}></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.editingCanvasDefinition.gridX} label={this.pdLoc.GridX} type="number" suffix="px" onChange={this.onSettingsChanged}></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.editingCanvasDefinition.gridY} label={this.pdLoc.GridY} type="number" suffix="px" onChange={this.onSettingsChanged}></v-text-field>
                </v-col>
            </v-row>
        </v-container>;
    }

    onSettingsChanged() {
        this.processDesignerStore.mutations.updateCanvasSettings.commit(this.editingCanvasDefinition);
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return <div>
            <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                <v-toolbar-title>{this.pdLoc.CanvasSettings}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={this.onClose}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
            {this.editingCanvasDefinition ? this.renderSettings(h) : null}
        </div>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DrawingCanvasSettingsComponent);
});

