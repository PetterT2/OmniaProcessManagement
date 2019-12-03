import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, MediaPickerProvider, MediaPickerProviderMediaTypes, DialogPositions, MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';
import { DrawingCanvasSettingsStyles } from '../../../fx/models/styles';
import { TabRenderer } from '../../core';
import { ProcessDesignerStore } from '../../stores';
import { CurrentProcessStore } from '../../../fx';
import { CanvasDefinition } from '../../../fx/models';
import { InternalOPMTopics } from '../../../core/messaging/InternalOPMTopics';
import './DrawingCanvasSettings.css';
import { classes } from 'typestyle';
import { ProcessDesignerLocalization } from '../../loc/localize';

export interface DrawingCanvasSettingsProps {
}

@Component
export class DrawingCanvasSettingsComponent extends VueComponentBase<DrawingCanvasSettingsProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openedImageDialog: boolean = false;
    canvasSettingsStyles = StyleFlow.use(DrawingCanvasSettingsStyles);
   
    created() {
        this.init();
    }

    init() {
       
    }

    get editingCanvasDefinition() {
        let result: CanvasDefinition = null;
        if (this.processDesignerStore.editingProcessReference.state) {
            result = this.processDesignerStore.editingProcessReference.state.processData.canvasDefinition;
        }
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

    onSaveImage(image: MediaPickerImageTransformerProviderResult) {
        let imageResult: any = image;
        let fileExtension = this.getFileExtension(imageResult.name);
        let fileName = ""
        if (Utils.isNullOrEmpty(fileExtension)) fileName = imageResult.name + '.' + image.format;
        else fileName = imageResult.name;

        //ToDo

        //this.isSaving = true;
        //this.imageService.uploadImage(imageResult.base64, fileName)
        //    .then((imageUrl) => {
        //        this.currentStep.advancedImage = {
        //            base64: imageUrl,
        //            configuration: this.handleImageMediaDataConfiguration(image),
        //            extraRatios: image.extraRatios,
        //            description: image.description
        //        }
        //        this.isSaving = false;
        //    }).catch(() => { });

    }
    getFileExtension(url: string) {
        var fileExtension = "";
        if (!Utils.isNullOrEmpty(url)) {
            var i = url.lastIndexOf('.');
            if (i >= 0) {
                fileExtension = url.split('.').pop();
            }
            fileExtension = fileExtension.split('?')[0];
        }
        return fileExtension.toLowerCase();
    }

    private imageTransformElement = {
        elementNameToRender: "omfx-image-transformer"
        //elementProps: this.transformcomp
    };
    private onConfigureProviders(providers: Array<MediaPickerProvider>) {
        providers = providers.filter((item) => {
            return item.mediaType !== MediaPickerProviderMediaTypes.video
        });

        providers.map((provider) => {
            let tmpProvider = provider as any
            if (!tmpProvider.onSaved && provider.mediaType === MediaPickerProviderMediaTypes.image) {
                tmpProvider.onSaved = this.onSaveImage;
            }
            //if (provider.mediaType === MediaPickerProviderMediaTypes.image && !tmpProvider.transformComponent) {
            //    tmpProvider.transformComponent = this.imageTransformElement;
            //}
        })
        return providers;
    }

    private renderImageDialogPlaceHolder(h) {
        return (
            <omfx-dialog contentClass={classes("image-dialog", this.canvasSettingsStyles.mediaPickerDialog)} domProps-lazy={false} onClose={this.closeImageDialog} model={{ visible: this.openedImageDialog }} position={DialogPositions.Center}>
                <div class={classes("omfx-image-picker-form")}>
                    {
                        this.openedImageDialog && <omfx-media-picker providers={[]} domProps-onConfigureProviders={this.onConfigureProviders} onClose={this.closeImageDialog} ></omfx-media-picker>
                    }
                </div>
            </omfx-dialog>
        )
    }

    private closeImageDialog() {
        this.openedImageDialog = false;
    }
    private openImageDialog() {
        this.openedImageDialog = true;
    }

    renderSettings(h) {
        return <v-container>
            <v-row>
                <v-col>
                    <div>{this.pdLoc.BackgroundImage}</div>
                    <a onClick={this.openImageDialog} href="javascript:void(0)">{this.pdLoc.AddImage}</a>
                    {this.renderImageDialogPlaceHolder(h)}
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <div>{this.pdLoc.Size}</div>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.editingCanvasDefinition.width} label={this.pdLoc.Width} type="number" suffix="px" onChange={this.onSettingsChanged}></v-text-field>
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
        //The canvas drawing can only re-draw based on publish Topic technique
        InternalOPMTopics.onEditingCanvasDefinitionChange.publish(this.editingCanvasDefinition);
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

