import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, FormValidator, FieldValueValidation, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, DialogPositions } from '@omnia/fx/ux';
import { Prop, Watch } from 'vue-property-decorator';
import { CurrentProcessStore,  ProcessTemplateStore, DrawingCanvas, ShapeTemplatesConstants } from '../../fx';
import './ShapeType.css';
import { DrawingShapeDefinition, DrawingShapeTypes, TextPosition, Link } from '../../fx/models';
import { ShapeTypeCreationOption, DrawingShapeOptions } from '../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { ShapeTypeStyles } from '../../fx/models/styles';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';

export interface ShapeSelectionProps {    
    drawingOptions: DrawingShapeOptions;
    formValidator: FormValidator;
    isHideCreateNew?: boolean;
    changeShapeCallback?: () => void;
    changeDrawingOptionsCallback?: (options: DrawingShapeOptions) => void;
}

@Component
export class ShapeTypeComponent extends VueComponentBase<ShapeSelectionProps> implements IWebComponentInstance{    
    @Prop() drawingOptions: DrawingShapeOptions;
    @Prop() formValidator: FormValidator;
    @Prop() isHideCreateNew?: boolean;
    @Prop() changeShapeCallback?: () => void;
    @Prop() changeDrawingOptionsCallback?: (options: DrawingShapeOptions) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    shapeTypeStepStyles = StyleFlow.use(ShapeTypeStyles);
    private drawingCanvas: DrawingCanvas = null;
    private internalShapeDefinition: DrawingShapeDefinition = null;//ToDo check other type?
    private selectedShapeType: DrawingShapeTypes = DrawingShapeTypes.ProcessStep;
    private previewCanvasId: GuidValue = Guid.newGuid();
    private selectedProcessStepId: GuidValue = Guid.empty;
    private selectedCustomLinkId: GuidValue = Guid.empty;
    private shapeTitle: MultilingualString = null;
    private textPositions = [
        {
            value: TextPosition.Above,
            title: this.opmCoreloc.DrawingShapeSettings.Above
        },
        {
            value: TextPosition.Center,
            title: this.opmCoreloc.DrawingShapeSettings.Center
        },
        {
            value: TextPosition.Bottom,
            title: this.opmCoreloc.DrawingShapeSettings.Below
        }
    ];
    private shapeTypes = [
        {
            value: DrawingShapeTypes.Undefined,
            title: this.pdLoc.ShapeTypes.None
        },
        {
            value: DrawingShapeTypes.ProcessStep,
            title: this.pdLoc.ShapeTypes.ProcessStep
        },
        {
            value: DrawingShapeTypes.CustomLink,
            title: this.pdLoc.ShapeTypes.Link
        }
    ];
    private isShowAddLinkDialog: boolean = false;
    private isCreatingChildStep: boolean = false;

    //Support to change selected shape in Drawing
    @Watch('drawingOptions', { deep: false })
    onShapeToEditSettingsChanged(newValue: DrawingShapeOptions, oldValue: DrawingShapeOptions) {
        if (newValue.id !== oldValue.id) {
            this.init();
            this.startToDrawShape();
        }
    }
    created() {
        this.init();
    }

    mounted() {
        this.startToDrawShape();
    }
       
    init() {
        this.internalShapeDefinition = Utils.clone(this.drawingOptions.shapeDefinition);//Use internal definition to render the review section        
        this.selectedShapeType = this.drawingOptions.shapeType;
        this.selectedProcessStepId = this.drawingOptions.processStepId;
        this.selectedCustomLinkId = this.drawingOptions.customLinkId;        
        this.shapeTitle = this.drawingOptions.title ? this.drawingOptions.title : this.internalShapeDefinition.title;
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private onDrawingShapeOptionChanged() {
        let drawingOptions: DrawingShapeOptions = {
            shapeDefinition: this.internalShapeDefinition,
            shapeType: this.selectedShapeType,
            processStepId: this.selectedProcessStepId,
            customLinkId: this.selectedCustomLinkId,
            title: this.shapeTitle
        };
        if (this.changeDrawingOptionsCallback) {
            this.changeDrawingOptionsCallback(drawingOptions);
        }
    }

    private onSelectedShapeType() {
        this.selectedProcessStepId = !this.isHideCreateNew ? Guid.empty : null;
        this.selectedCustomLinkId = !this.isHideCreateNew ? Guid.empty : null;
        this.shapeTitle = null;
        this.onDrawingShapeOptionChanged();
    }
    private onSelectedProcessChanged() {
        let childSteps = this.currentProcessStore.getters.referenceData().current.processStep.processSteps;
        let selectedStep = childSteps.find(item => item.id == this.selectedProcessStepId);
        if (selectedStep) {
            this.shapeTitle = Utils.clone(selectedStep.title);
        }
        else
            this.shapeTitle = null;
     
        this.onDrawingShapeOptionChanged();   
    }
  
    private onSelectedLinkChanged() {
        let links = this.currentProcessStore.getters.referenceData().current.processData.links;
        if (links) {
            let selectedLink = links.find(item => item.id == this.selectedCustomLinkId);
            if (selectedLink) {
                this.shapeTitle = Utils.clone(selectedLink.title);
            }
            else
                this.shapeTitle = null;
        }
      
        this.onDrawingShapeOptionChanged();
    }

    private createLinkCallback(createdLink: Link) {
        this.isShowAddLinkDialog = false;
        this.selectedCustomLinkId = createdLink.id;

        this.onDrawingShapeOptionChanged();
    }

    renderShapePreview(h) {
        return <div onMouseover={this.previewActivedShape} onMouseleave={this.updateDrawedShape} class={this.shapeTypeStepStyles.canvasPreviewWrapper}><canvas id={this.previewCanvasId.toString()}></canvas></div>;
    }
    private initShapeTitle() {
        let result = this.shapeTitle;
        let shapeTitleStringValue = this.multilingualStore.getters.stringValue(result);
        if (!shapeTitleStringValue || shapeTitleStringValue.length == 0) {
            result = this.internalShapeDefinition.title;
        }
        return result;
    }
    startToDrawShape() {
        if (this.internalShapeDefinition) {
            if (this.drawingCanvas)
                this.drawingCanvas.destroy();
            this.$nextTick(() => {
                this.drawingCanvas = new DrawingCanvas(this.previewCanvasId.toString(), {},
                    {
                        drawingShapes: [],
                        width: this.internalShapeDefinition.width,
                        height: this.internalShapeDefinition.height
                    });
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, this.internalShapeDefinition, this.shapeTitle, false, 0, 0);
            });
            setTimeout(() => {
               
            }, 200);
        }
    }

    updateDrawedShape() {
        if (this.drawingCanvas) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, this.internalShapeDefinition, this.shapeTitle, false);
        }
        this.onDrawingShapeOptionChanged();   
    }

    previewActivedShape() {
        if (this.drawingCanvas) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, this.internalShapeDefinition, this.shapeTitle, true);
        }
    }
    private renderShapeTypeOptions(h) {
        return <v-container>
            <v-row>
                <v-col cols="6">
                    <v-select item-value="value" item-text="title" items={this.shapeTypes} label={this.pdLoc.ShapeType}
                        onChange={this.onSelectedShapeType} v-model={this.selectedShapeType}></v-select>
                    {this.selectedShapeType == DrawingShapeTypes.ProcessStep ?
                        this.renderChildProcessSteps(h)
                        : null
                    }
                    {this.selectedShapeType == DrawingShapeTypes.CustomLink ?
                        this.renderCustomLinkOptions(h)
                        : null
                    }
                    <omfx-field-validation
                        useValidator={this.formValidator}
                        checkValue={this.internalShapeDefinition.textPosition}
                        rules={new FieldValueValidation().IsRequired().getRules()}>
                    </omfx-field-validation>
                    <omfx-multilingual-input
                        requiredWithValidator={this.formValidator}
                        model={this.shapeTitle}
                        onModelChange={(title) => { this.shapeTitle = title; this.updateDrawedShape(); }}
                        forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                    {this.renderChangeShapeSection(h)}
                </v-col>
                <v-col cols="6">
                    {this.renderShapePreview(h)}
                </v-col>
            </v-row>
        </v-container>;
    }
    private renderChildProcessSteps(h) {
        let processStepOptions = [];
        if (!this.isHideCreateNew) {
            processStepOptions.push({
                id: Guid.empty,
                title: '[' + this.pdLoc.New + ']'
            });
        }
        let childSteps = this.currentProcessStore.getters.referenceData().current.processStep.processSteps;
        if (childSteps) {
            processStepOptions = processStepOptions.concat(childSteps.map(item => {
                return {
                    id: item.id,
                    title: this.multilingualStore.getters.stringValue(item.title)
                }
            }));
        }

        return <div>
            <v-select item-value="id" item-text="title" items={processStepOptions} v-model={this.selectedProcessStepId} onChange={this.onSelectedProcessChanged}></v-select>
            <omfx-field-validation
                useValidator={this.formValidator}
                checkValue={this.selectedProcessStepId}
                rules={new FieldValueValidation().IsRequired().getRules()}>
            </omfx-field-validation>
        </div>;
    }
    private renderCustomLinkOptions(h) {
        let customLinkOptions = [{
            id: Guid.empty,
            title: '[' + this.pdLoc.New + ']'
        }];
        let customLinks = this.currentProcessStore.getters.referenceData().current.processData.links;
        if (customLinks) {
            customLinkOptions = customLinkOptions.concat(customLinks.map(item => {
                return {
                    id: item.id,
                    title: this.multilingualStore.getters.stringValue(item.title)
                }
            }));
        }
        return <div>
            <v-select item-value="id" item-text="title" items={customLinkOptions} v-model={this.selectedCustomLinkId} onChange={this.onSelectedLinkChanged}></v-select>
            <omfx-field-validation
                useValidator={this.formValidator}
                checkValue={this.selectedCustomLinkId}
                rules={new FieldValueValidation().IsRequired().getRules()}>
            </omfx-field-validation>
            {this.selectedCustomLinkId == Guid.empty ? <a onClick={this.openCreateLinkDialog} href="javascript:void(0)">{this.pdLoc.AddLink}</a> : null}
            {this.renderCreateLinkDialog(h)}
        </div>;
    }
    private openCreateLinkDialog() {
        this.isShowAddLinkDialog = true;
    }
    private closeCreateLinkDialog() {
        this.isShowAddLinkDialog = false;
    }
    private renderCreateLinkDialog(h) {
        if (!this.isShowAddLinkDialog)
            return null;

        return <omfx-dialog
            hideCloseButton={true}
            model={{ visible: true }}
            maxWidth="800px"
            dark={this.omniaTheming.promoted.header.dark}
            contentClass={this.omniaTheming.promoted.body.class}
            position={DialogPositions.Center}
        >
            <div style={{ height: '100%' }}>
              
            </div>
        </omfx-dialog>;

    }
    private renderShapeSettings(h) {
        return <v-container>           
            <v-row dense>
                <v-col cols="6">
                    <v-select item-value="value" item-text="title" items={this.textPositions} label={this.opmCoreloc.DrawingShapeSettings.TextPosition}
                        onChange={this.updateDrawedShape} v-model={this.internalShapeDefinition.textPosition}></v-select>
                    <omfx-field-validation
                        useValidator={this.formValidator}
                        checkValue={this.internalShapeDefinition.textPosition}
                        rules={new FieldValueValidation().IsRequired().getRules()}>
                    </omfx-field-validation>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model={this.internalShapeDefinition.fontSize} label={this.opmCoreloc.DrawingShapeSettings.FontSize}
                        onChange={this.updateDrawedShape} type="number" suffix="px"></v-text-field>
                    <omfx-field-validation
                        useValidator={this.formValidator}
                        checkValue={this.internalShapeDefinition.fontSize}
                        rules={new FieldValueValidation().IsRequired().getRules()}>
                    </omfx-field-validation>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaLoc.Common.BackgroundColor}
                                model={{ color: this.internalShapeDefinition.backgroundColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.backgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaLoc.Common.BorderColor}
                                model={{ color: this.internalShapeDefinition.borderColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.borderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.TextColor}
                                model={{ color: this.internalShapeDefinition.textColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.textColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBackgroundColor}
                                model={{ color: this.internalShapeDefinition.activeBackgroundColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.activeBackgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBorderColor}
                                model={{ color: this.internalShapeDefinition.activeBorderColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.activeBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveTextColor}
                                model={{ color: this.internalShapeDefinition.activeTextColor }}
                                disableRgba={true}
                                onChange={(p) => { this.internalShapeDefinition.activeTextColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>;
    }
    private renderDrawingShapeDefinition(h) {
        return <div>
            {this.renderShapeTypeOptions(h)}
            {this.renderShapeSettings(h)}            
        </div>;
    }
    private renderFreeFormShapeDefinition(h) {
        return <div>
           ToDo
        </div>;
    }
    private renderMediaShapeDefinition(h) {
        return <div>
            ToDo
        </div>;
    }
    private renderChangeShapeSection(h) {
        return <v-btn text color={this.omniaTheming.themes.primary.base} dark={this.omniaTheming.promoted.body.dark} onClick={this.changeShapeCallback}>{this.pdLoc.ChangeShape}</v-btn>
    }
    /**
        * Render 
        * @param h
        */
    render(h) {
        if (this.drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Freeform.id)
            return this.renderFreeFormShapeDefinition(h);

        if (this.drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Media.id)
            return this.renderMediaShapeDefinition(h);

        return this.renderDrawingShapeDefinition(h);
    }
}