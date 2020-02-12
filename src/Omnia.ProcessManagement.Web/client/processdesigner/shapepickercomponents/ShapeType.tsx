import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, FormValidator, FieldValueValidation, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, DialogPositions } from '@omnia/fx/ux';
import { Prop, Watch } from 'vue-property-decorator';
import { CurrentProcessStore, DrawingCanvas, ShapeTemplatesConstants, IShape, TextSpacingWithShape, IFabricShape, DrawingCanvasFreeForm, Shape, MediaShape } from '../../fx';
import './ShapeType.css';
import { DrawingShapeDefinition, DrawingShapeTypes, TextPosition, TextAlignment, Link, Enums, DrawingShape, DrawingImageShapeDefinition, DrawingProcessStepShape, DrawingCustomLinkShape } from '../../fx/models';
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
    reInitFormValidator?: () => void;
}

@Component
export class ShapeTypeComponent extends VueComponentBase<ShapeSelectionProps> implements IWebComponentInstance {
    @Prop() drawingOptions: DrawingShapeOptions;
    @Prop() formValidator: FormValidator;
    @Prop() isHideCreateNew?: boolean;
    @Prop() changeShapeCallback?: () => void;
    @Prop() changeDrawingOptionsCallback?: (options: DrawingShapeOptions) => void;
    @Prop() reInitFormValidator?: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    shapeTypeStepStyles = StyleFlow.use(ShapeTypeStyles);
    private drawingCanvas: DrawingCanvas = null;
    private internalShapeDefinition: DrawingShapeDefinition = null;//ToDo check other type?
    private selectedShapeType: DrawingShapeTypes = null;
    private previewCanvasId: GuidValue = Guid.newGuid();
    private selectedProcessStepId: GuidValue = Guid.empty;
    private selectedCustomLinkId: GuidValue = Guid.empty;
    private shapeTitle: MultilingualString = null;
    private shape: IShape = null;
    private textPositions = [
        {
            value: TextPosition.Above,
            title: this.opmCoreloc.DrawingShapeSettings.Above
        },
        {
            value: TextPosition.On,
            title: this.opmCoreloc.DrawingShapeSettings.On
        },
        {
            value: TextPosition.Bottom,
            title: this.opmCoreloc.DrawingShapeSettings.Below
        }
    ];
    private textAlignment = [
        {
            value: TextAlignment.Left,
            title: this.opmCoreloc.DrawingShapeSettings.Left
        },
        {
            value: TextAlignment.Center,
            title: this.opmCoreloc.DrawingShapeSettings.Center
        },
        {
            value: TextAlignment.Right,
            title: this.opmCoreloc.DrawingShapeSettings.Right
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
    private isOpenMediaPicker: boolean = false;
    private isOpenFreeformPicker: boolean = false;

    //Support to change selected shape in Drawing
    @Watch('drawingOptions', { deep: false })
    onShapeToEditSettingsChanged(newValue: DrawingShapeOptions, oldValue: DrawingShapeOptions) {
        this.init();
        this.startToDrawShape();
    }
    created() {
        if (this.formValidator) {
            var component: any = this;
            this.formValidator.register(component);
        }

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
        this.shapeTitle = this.drawingOptions.title;
        this.setAngle();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
    }

    private onDrawingShapeOptionChanged() {
        let drawingOptions: DrawingShapeOptions = {
            shapeDefinition: this.internalShapeDefinition,
            shapeType: this.selectedShapeType,
            processStepId: this.selectedProcessStepId,
            customLinkId: this.selectedCustomLinkId,
            title: this.shapeTitle,
            shape: this.shape
        };
        if (this.changeDrawingOptionsCallback) {
            this.changeDrawingOptionsCallback(drawingOptions);
        }
    }

    private onSelectedShapeType(selectedShapeType) {
        if (this.reInitFormValidator)
            this.reInitFormValidator();
        this.selectedProcessStepId = !this.isHideCreateNew ? Guid.empty : null;
        this.selectedCustomLinkId = Guid.empty;
        this.shapeTitle = null;
        this.onDrawingShapeOptionChanged();
    }
    private onSelectedProcessChanged() {
        if (this.reInitFormValidator)
            this.reInitFormValidator();
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
        if (this.reInitFormValidator)
            this.reInitFormValidator();
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
        this.shapeTitle = createdLink.title;
        this.onDrawingShapeOptionChanged();
    }

    redrawFreeShape() {
        this.isOpenFreeformPicker = true;
    }

    private updateAfterRenderImage(readyDrawingShape: DrawingShape) {
        this.drawingCanvas.updateCanvasSize(readyDrawingShape);
        this.onDrawingShapeOptionChanged();
    }

    private setAngle() {
        if (this.drawingOptions && this.drawingOptions.shape && this.drawingOptions.shape.nodes)
            this.drawingOptions.shape.nodes.forEach(n => n.properties.angle = 0);
    }

    private onImageSaved(imageUrl: string) {
        (this.internalShapeDefinition as DrawingImageShapeDefinition).imageUrl = imageUrl;
        if (this.drawingCanvas && this.drawingCanvas.drawingShapes.length > 0) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, this.internalShapeDefinition, this.shapeTitle, false, 0,
                this.internalShapeDefinition.textPosition == TextPosition.Above ? this.internalShapeDefinition.fontSize + TextSpacingWithShape : 0)
                .then((readyDrawingShape: DrawingShape) => {
                    this.updateAfterRenderImage(readyDrawingShape);
                });
        }
        else {
            this.drawingCanvas.addShape(Guid.newGuid(), this.selectedShapeType, this.internalShapeDefinition, this.shapeTitle, 0, 0)
                .then((readyDrawingShape: DrawingShape) => {
                    this.updateAfterRenderImage(readyDrawingShape);
                });
        }
    }

    renderShapePreview(h) {
        let isFreeform = this.drawingOptions.shapeDefinition.shapeTemplate.id === ShapeTemplatesConstants.Freeform.id;
        let isMedia = this.drawingOptions.shapeDefinition.shapeTemplate.id === ShapeTemplatesConstants.Media.id;
        let renderCanvas = !this.isNewFreeForm() && !this.isNewMedia();
        return [

            <div class={this.shapeTypeStepStyles.previewWrapper}>
                {
                    renderCanvas &&
                    <div class={this.shapeTypeStepStyles.webkitScrollbar}>
                        <div class={this.shapeTypeStepStyles.canvasPreviewWrapper}><canvas id={this.previewCanvasId.toString()}></canvas></div>
                    </div>
                }
                {
                    !renderCanvas && isFreeform && <v-icon>fa fa-draw-polygon</v-icon>
                }
                {
                    !renderCanvas && isMedia && <v-icon>fa fa-photo-video</v-icon>
                }
                {
                    isFreeform &&
                    <v-btn
                        class="mt-2"
                        text
                        color={this.omniaTheming.themes.primary.base}
                        dark={this.omniaTheming.promoted.body.dark}
                        onClick={this.redrawFreeShape}>
                        {renderCanvas ? this.pdLoc.RedrawShape : this.pdLoc.DrawShape}
                    </v-btn>
                }
                {
                    isMedia &&
                    <v-btn
                        class="mt-2"
                        text
                        color={this.omniaTheming.themes.primary.base}
                        dark={this.omniaTheming.promoted.body.dark}
                        onClick={() => { this.isOpenMediaPicker = true; }}>
                        {renderCanvas ? this.pdLoc.EditImage : this.pdLoc.AddImage}
                    </v-btn>
                }
            </div>,
            this.isOpenMediaPicker && <opm-media-picker onImageSaved={this.onImageSaved} onClosed={() => { this.isOpenMediaPicker = false; }}></opm-media-picker>
        ];
    }

    private getCanvasSize(): { width: number, height: number } {
        let canvasWidth = this.getNumber(this.internalShapeDefinition.width);
        let canvasHeight = this.getNumber(this.internalShapeDefinition.height);
        if (this.internalShapeDefinition.textPosition != TextPosition.On)
            canvasHeight += this.internalShapeDefinition.fontSize + TextSpacingWithShape;
        if (!Utils.isNullOrEmpty(this.internalShapeDefinition.borderColor)) {
            canvasWidth += 2;
            canvasHeight += 2;
        }

        return { width: canvasWidth, height: canvasHeight };
    }

    initDrawingCanvas() {
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();

        let canvasSize = this.getCanvasSize();

        this.drawingCanvas = new DrawingCanvas(this.previewCanvasId.toString(), {},
            {
                drawingShapes: [],
                width: canvasSize.width,
                height: canvasSize.height
            }, true, false);
    }

    startToDrawShape() {
        if (this.internalShapeDefinition) {
            setTimeout(() => {
                this.initDrawingCanvas();
                this.drawingCanvas.addShape(Guid.newGuid(), this.selectedShapeType, this.internalShapeDefinition, this.shapeTitle, 0, 0, this.drawingOptions.processStepId, this.drawingOptions.customLinkId, this.drawingOptions.shape ? this.drawingOptions.shape.nodes : null);
            }, 20);
        }
    }

    private isNewMedia() {
        return this.drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Media.id &&
            !(this.internalShapeDefinition as DrawingImageShapeDefinition).imageUrl ? true : false;
    }

    private isNewFreeForm() {
        return this.drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Freeform.id &&
            (!this.drawingOptions.shape || this.drawingOptions.shape.nodes.length == 0) ? true : false;
    }

    private getNumber(value: any) {
        if (typeof (value) == 'string')
            return parseInt(value);
        return value;
    }

    updateDrawedShape() {
        if (this.drawingCanvas && this.drawingCanvas.drawingShapes.length > 0) {
            let top = this.internalShapeDefinition.textPosition == TextPosition.Above ? this.internalShapeDefinition.fontSize + TextSpacingWithShape : 0;
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, this.internalShapeDefinition, this.shapeTitle, false, this.drawingCanvas.drawingShapes[0].shape.left || 0, top)
                .then((readyDrawingShape: DrawingShape) => {
                    this.shape = this.drawingCanvas.drawingShapes[0].shape;

                    if (readyDrawingShape && readyDrawingShape.shape.name == ShapeTemplatesConstants.Media.name)
                        this.updateAfterRenderImage(readyDrawingShape);
                    else {
                        this.onDrawingShapeOptionChanged();
                    }
                });
        }
        else {
            this.onDrawingShapeOptionChanged();
        }
    }

    private addFreefromShape(shape: IShape) {
        this.isOpenFreeformPicker = false;
        if (shape != null) {
            this.shape = shape;
            this.internalShapeDefinition.width = this.shape.nodes[0].properties['width'];
            this.internalShapeDefinition.height = this.shape.nodes[0].properties['height'];
            this.onDrawingShapeOptionChanged();
            this.startToDrawShape();
        }
    }

    private renderShapeTypeOptions(h) {
        let isNewProcessStep = this.selectedShapeType == DrawingShapeTypes.ProcessStep && this.selectedProcessStepId == Guid.empty;
        return <v-container class="pa-0">
            <v-row dense>
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
                    <omfx-multilingual-input
                        requiredWithValidator={isNewProcessStep ? this.formValidator : null}
                        model={this.shapeTitle}
                        onModelChange={(title) => {
                            this.shapeTitle = title;
                            this.updateDrawedShape();
                        }}
                        forceTenantLanguages={isNewProcessStep} label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
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
            <v-select item-value="id" item-text="title" items={processStepOptions} v-model={this.selectedProcessStepId}
                onChange={this.onSelectedProcessChanged}
                rules={new FieldValueValidation().IsRequired().getRules()}
            ></v-select>
        </div>;
    }
    private renderCustomLinkOptions(h) {
        let customLinkOptions = [{
            id: Guid.empty,
            title: '[' + this.pdLoc.New + ']'
        }];
        let customLinks = this.currentProcessStore.getters.referenceData().current.processData.links;
        if (customLinks) {
            customLinkOptions = customLinkOptions.concat(customLinks.filter(item => item.linkType != Enums.LinkType.Heading).map(item => {
                return {
                    id: item.id,
                    title: this.multilingualStore.getters.stringValue(item.title)
                }
            }));
        }
        return <div>
            <v-select item-value="id" item-text="title" items={customLinkOptions} v-model={this.selectedCustomLinkId}
                onChange={this.onSelectedLinkChanged}
                rules={new FieldValueValidation().IsRequired().getRules()}></v-select>
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
                <opm-processdesigner-createlink onClose={this.closeCreateLinkDialog} onSave={this.createLinkCallback} linkType={Enums.LinkType.CustomLink} isProcessStepShortcut={false}></opm-processdesigner-createlink>
            </div>
        </omfx-dialog>;

    }

    private renderShapeSettings(h) {
        let isMediaShape = this.drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Media.id;
        return <v-container fluid class="px-0 pt-0">
            <v-row dense align="center">
                <v-col cols="6">
                    <v-select item-value="value" item-text="title" items={this.textPositions} label={this.opmCoreloc.DrawingShapeSettings.TextPosition}
                        onChange={this.updateDrawedShape} v-model={this.internalShapeDefinition.textPosition}></v-select>
                    <v-select item-value="value" item-text="title" items={this.textAlignment} label={this.opmCoreloc.DrawingShapeSettings.TextAlignment}
                        onChange={this.updateDrawedShape} v-model={this.internalShapeDefinition.textAlignment}></v-select>
                    <v-text-field v-model={this.internalShapeDefinition.fontSize} label={this.opmCoreloc.DrawingShapeSettings.FontSize}
                        onChange={this.updateDrawedShape} type="number" suffix="px"
                        rules={new FieldValueValidation().IsRequired().getRules()}></v-text-field>
                </v-col>
                <v-col cols="6" class="text-center">
                    <opm-point-picker
                        label={this.opmCoreloc.DrawingShapeSettings.TextAdjustment}
                        model={{ x: this.internalShapeDefinition.textHorizontalAdjustment, y: this.internalShapeDefinition.textVerticalAdjustment }}
                        onModelChange={(model) => {
                            this.internalShapeDefinition.textHorizontalAdjustment = model.x;
                            this.internalShapeDefinition.textVerticalAdjustment = model.y;
                            this.updateDrawedShape()
                        }}
                    ></opm-point-picker>
                </v-col>
            </v-row>

            <v-row>
                {
                    isMediaShape ? null
                        :
                        <v-col cols="4">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaLoc.Common.BackgroundColor}
                                model={{ color: this.internalShapeDefinition.backgroundColor }}
                                allowRgba
                                onChange={(p) => { this.internalShapeDefinition.backgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                }
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        required={true}
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.omniaLoc.Common.BorderColor}
                        model={{ color: this.internalShapeDefinition.borderColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.borderColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        required={true}
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.opmCoreloc.DrawingShapeSettings.TextColor}
                        model={{ color: this.internalShapeDefinition.textColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.textColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
            </v-row>

            <v-row>
                {
                    isMediaShape ? null
                        :
                        <v-col cols="4">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.HoverBackgroundColor}
                                model={{ color: this.internalShapeDefinition.hoverBackgroundColor }}
                                allowRgba
                                onChange={(p) => { this.internalShapeDefinition.hoverBackgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                }
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.opmCoreloc.DrawingShapeSettings.HoverBorderColor}
                        model={{ color: this.internalShapeDefinition.hoverBorderColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.hoverBorderColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.opmCoreloc.DrawingShapeSettings.HoverTextColor}
                        model={{ color: this.internalShapeDefinition.hoverTextColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.hoverTextColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
            </v-row>

            <v-row>
                {
                    isMediaShape ? null :
                        <v-col cols="4">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.SelectedBackgroundColor}
                                model={{ color: this.internalShapeDefinition.selectedBackgroundColor }}
                                allowRgba
                                onChange={(p) => { this.internalShapeDefinition.selectedBackgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                }
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.opmCoreloc.DrawingShapeSettings.SelectedBorderColor}
                        model={{ color: this.internalShapeDefinition.selectedBorderColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.selectedBorderColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
                <v-col cols={isMediaShape ? "6" : "4"}>
                    <omfx-color-picker
                        dark={this.omniaTheming.promoted.body.dark}
                        label={this.opmCoreloc.DrawingShapeSettings.SelectedTextColor}
                        model={{ color: this.internalShapeDefinition.selectedTextColor }}
                        allowRgba
                        onChange={(p) => { this.internalShapeDefinition.selectedTextColor = p.color; this.updateDrawedShape(); }}>
                    </omfx-color-picker>
                </v-col>
            </v-row>

        </v-container>;
    }

    private renderFreefromPicker(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        var canvasDefinition = Utils.clone(currentReferenceData.current.processData.canvasDefinition);
        canvasDefinition.drawingShapes = [];

        return <opm-freeform-picker
            canvasDefinition={canvasDefinition}
            shapeDefinition={this.drawingOptions.shapeDefinition}
            save={(shape: IShape) => { this.addFreefromShape(shape); }}
            closed={() => { this.isOpenFreeformPicker = false; }}
        ></opm-freeform-picker>
    }

    private renderDrawingShapeDefinition(h) {
        return <div>
            {this.renderShapeTypeOptions(h)}
            {this.renderShapeSettings(h)}
        </div>
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (
            <div>
                {this.renderDrawingShapeDefinition(h)}
                {this.isOpenFreeformPicker && this.renderFreefromPicker(h)}
            </div>)
    }
}