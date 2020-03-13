import { Inject, Localize, Utils } from '@omnia/fx';
import { GuidValue, Guid } from '@omnia/fx-models';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase, FormValidator, FieldValueValidation, MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ShapeTemplateStore, ShapeObject, DrawingCanvas, ShapeTemplatesConstants, TextSpacingWithShape, FabricShapeData, OPMUtils } from '../../../../../fx';
import { ShapeGalleryJourneyStore } from '../../store';
import {
    ShapeTemplate, ShapeGalleryDefaultSettingStyles, CanvasDefinition, TextPosition, TextAlignment, DrawingShapeTypes, DrawingImageShapeDefinition, DrawingShape,
    DrawingShapeDefinition, ShapeTemplateFreeformSettings, ShapeTemplateMediaSettings, ShapeTemplateType, ShapeDefinition, ShapeDefinitionTypes
} from '../../../../../fx/models';
import { OPMCoreLocalization } from '../../../../../core/loc/localize';
import './ShapeGalleryDefaultSettingsBlade.css';
import { MultilingualStore } from '@omnia/fx/store';
import { ShapeGalleryMediaPickerComponent } from '../../mediapicker/ShapeGalleryMediaPicker';
import { settings } from 'cluster';
import { setTimeout } from 'timers';

interface ShapeGalleryDefaultSettingsBladeProps {
    journey: () => JourneyInstance;
}

interface ShapeTemplateForSelect extends ShapeTemplate {
    type?: ShapeTemplateType
}

@Component
export default class ShapeGalleryDefaultSettingsBlade extends VueComponentBase<ShapeGalleryDefaultSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ShapeGalleryJourneyStore) shapeGalleryJournayStore: ShapeGalleryJourneyStore;
    @Inject(ShapeTemplateStore) shapeGalleryStore: ShapeTemplateStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    shapeGalleryItemTypes: Array<ShapeTemplateForSelect> = [
        ShapeTemplatesConstants.Freeform,
        ShapeTemplatesConstants.Media
    ];

    textPositions = [
        {
            value: TextPosition.Above,
            title: this.coreLoc.DrawingShapeSettings.Above
        },
        {
            value: TextPosition.On,
            title: this.coreLoc.DrawingShapeSettings.On
        },
        {
            value: TextPosition.Bottom,
            title: this.coreLoc.DrawingShapeSettings.Below
        }
    ];

    textAlignment = [
        {
            value: TextAlignment.Left,
            title: this.coreLoc.DrawingShapeSettings.Left
        },
        {
            value: TextAlignment.Center,
            title: this.coreLoc.DrawingShapeSettings.Center
        },
        {
            value: TextAlignment.Right,
            title: this.coreLoc.DrawingShapeSettings.Right
        }
    ];

    styles = StyleFlow.use(ShapeGalleryDefaultSettingStyles);
    canvasSize = 205;
    gridSize = 10;

    editingShapeGalleryItem: ShapeTemplate = null;
    drawingCanvas: DrawingCanvas = null;

    defaultShapeDefinition: DrawingShapeDefinition = {
        type: ShapeDefinitionTypes.Drawing,
        title: { isMultilingualString: true },
        id: Guid.newGuid(),
        shapeTemplateId: ShapeTemplatesConstants.Freeform.id,
        shapeTemplateType: ShapeTemplatesConstants.Freeform.settings.type,
        fontSize: 20,
        backgroundColor: this.omniaTheming.promoted.header.background.base,
        textColor: this.omniaTheming.promoted.header.text.base,
        textPosition: TextPosition.On,
        textAlignment: TextAlignment.Center,
        textHorizontalAdjustment: 0,
        textVerticalAdjustment: 0,
        width: 200,
        height: 200
    } as any;

    selectedImage: MediaPickerImageTransformerProviderResult = null;
    internalValidator: FormValidator = new FormValidator(this);
    previewCanvasId: GuidValue = Guid.newGuid();
    isOpenMediaPicker: boolean = false;
    isOpenFreeformPicker: boolean = false;
    isSaving: boolean = false;

    created() {
        this.shapeGalleryItemTypes.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
            shapeTemplateSelection.type = shapeTemplateSelection.settings.type;
        })
    }

    mounted() {
        this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();
        this.startToDrawShape();
    }

    beforeDestroy() {
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
    }

    destroyCanvas() {
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
            this.drawingCanvas = null;
        }
    }

    onShapeTemplateTypeChanged() {
        this.destroyCanvas();
        (this.editingShapeGalleryItem.settings as ShapeTemplateMediaSettings).imageUrl = null;
        (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes = null;
    }

    getShapeDefinitionToDraw() {
        var shapeDefinition = Utils.clone(this.defaultShapeDefinition);
        if (this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Freeform.settings.type) {
            var nodes = (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes;
            shapeDefinition.width = nodes[0].properties['width'];
            shapeDefinition.height = nodes[0].properties['height'];
        }
        else {
            (shapeDefinition as DrawingImageShapeDefinition).shapeTemplateId = ShapeTemplatesConstants.Media.id;
            (shapeDefinition as DrawingImageShapeDefinition).shapeTemplateType = ShapeTemplatesConstants.Media.settings.type;
            (shapeDefinition as DrawingImageShapeDefinition).imageUrl = (this.editingShapeGalleryItem.settings as ShapeTemplateMediaSettings).imageUrl;
        }
        return shapeDefinition;
    }

    drawFreeShape() {
        this.isOpenFreeformPicker = true;
    }

    onImageSaved(image: MediaPickerImageTransformerProviderResult) {
        this.selectedImage = image;
        (this.editingShapeGalleryItem.settings as ShapeTemplateMediaSettings).imageUrl = this.buildDataBlob(image.base64, image.format);
        if (this.drawingCanvas && this.drawingCanvas.drawingShapes.length > 0) {
            var shapeDefinition = this.getShapeDefinitionToDraw();
            this.drawingCanvas.updateShapeNodes(this.drawingCanvas.drawingShapes[0].id, shapeDefinition, null, false)
                .then((readyDrawingShape: DrawingShape) => {
                });
        }
        else {
            this.startToDrawShape();
        }
    }

    buildDataBlob(base64: string, imgformat: string): string {
        let mime: string = "image/" + imgformat;
        let binary: string = atob(base64);
        let array: any = [];
        for (let i: number = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        let blob: Blob = new Blob([new Uint8Array(array)], { type: mime });
        return window.URL.createObjectURL(blob);
    }

    addFreefromShape(shape: ShapeObject) {
        this.isOpenFreeformPicker = false;
        if (shape != null) {
            (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes = shape.nodes;
            this.startToDrawShape();
        }
    }

    startToDrawShape() {
        OPMUtils.waitForElementAvailable(this.$el, this.previewCanvasId.toString(), () => {
            this.initDrawingCanvas();
            var shapeDefinition = this.getShapeDefinitionToDraw();
            this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, shapeDefinition, null, null,
                (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes ? (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes : null)
                .then((readyDrawingShape: DrawingShape) => {
                    this.drawingCanvas.reUpdateCanvasSize(readyDrawingShape);
                });
        });
    }

    initDrawingCanvas() {
        this.destroyCanvas();
        this.drawingCanvas = new DrawingCanvas(this.previewCanvasId.toString(), {},
            {
                drawingShapes: [],
                width: this.canvasSize,
                height: this.canvasSize
            }, true, false);
    }

    save() {
        if (this.internalValidator.validateAll()) {
            this.isSaving = true;
            this.shapeGalleryStore.actions.addOrUpdateShapeTemplate.dispatch(this.editingShapeGalleryItem).then(() => {
                if (this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Media.settings.type) {
                    this.shapeGalleryStore.actions.addImage.dispatch(this.editingShapeGalleryItem.id.toString(), (this.selectedImage as any).name + '.' + this.selectedImage.format, this.selectedImage.base64).then(() => {
                        this.isSaving = false;
                        this.journey().travelBackToFirstBlade();
                    })
                }
                else {
                    this.isSaving = false;
                    this.journey().travelBackToFirstBlade();
                }
            })
        }
    }

    isNewMedia() {
        return this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Media.settings.type &&
            !(this.editingShapeGalleryItem.settings as ShapeTemplateMediaSettings).imageUrl ? true : false;
    }

    isNewFreeForm() {
        return this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Freeform.settings.type &&
            (!(this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes || (this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes.length == 0) ? true : false;
    }

    renderFreefromPicker(h) {
        var canvasDefinition: CanvasDefinition = {
            width: this.canvasSize,
            height: this.canvasSize,
            gridX: this.gridSize,
            gridY: this.gridSize,
            drawingShapes: []
        };

        return <opm-freeform-picker
            canvasDefinition={canvasDefinition}
            shapeDefinition={this.defaultShapeDefinition}
            save={(shape: ShapeObject) => { this.addFreefromShape(shape); }}
            closed={() => { this.isOpenFreeformPicker = false; }}
        ></opm-freeform-picker>
    }

    renderShapePreview(h) {
        let isFreeform = this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Freeform.settings.type;
        let isMedia = this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Media.settings.type;
        let renderCanvas = !this.isNewFreeForm() && !this.isNewMedia();

        return (
            <div class={this.styles.previewWrapper(this.canvasSize)}>
                {
                    renderCanvas &&
                    <div class={this.styles.webkitScrollbar(this.canvasSize)}>
                        <div class={this.styles.canvasPreviewWrapper(this.canvasSize)}><canvas id={this.previewCanvasId.toString()}></canvas></div>
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
                        onClick={this.drawFreeShape}>
                        {renderCanvas ? this.coreLoc.Buttons.RedrawShape : this.coreLoc.Buttons.DrawShape}
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
                        {renderCanvas ? this.coreLoc.Buttons.EditImage : this.coreLoc.Buttons.AddImage}
                    </v-btn>
                }
            </div>
        );
    }

    render(h) {
        this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();
        let isFreeform = this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Freeform.settings.type;
        let isMedia = this.editingShapeGalleryItem.settings.type == ShapeTemplatesConstants.Media.settings.type;

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{(this.editingShapeGalleryItem && this.editingShapeGalleryItem.id) ? this.editingShapeGalleryItem.multilingualTitle : this.loc.ShapeGallery.CreateShape}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    <omfx-multilingual-input
                        requiredWithValidator={this.internalValidator}
                        model={this.editingShapeGalleryItem.title}
                        onModelChange={(title) => { this.editingShapeGalleryItem.title = title; }}
                        forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
                    <v-select item-value="type" item-text="multilingualTitle" items={this.shapeGalleryItemTypes} value={this.editingShapeGalleryItem.settings.type}
                        v-model={this.editingShapeGalleryItem.settings.type} onChange={this.onShapeTemplateTypeChanged}></v-select>
                    <omfx-field-validation
                        useValidator={this.internalValidator}
                        checkValue={this.editingShapeGalleryItem.settings.type}
                        rules={new FieldValueValidation().IsRequired().getRules()}>
                    </omfx-field-validation>
                    <omfx-field-validation
                        useValidator={this.internalValidator}
                        checkValue={this.selectedImage}
                        rules={new FieldValueValidation().IsRequired(isMedia, this.loc.ShapeGallery.Messages.ImageShapeRequired).getRules()}>
                    </omfx-field-validation>
                    <omfx-field-validation
                        useValidator={this.internalValidator}
                        checkValue={(this.editingShapeGalleryItem.settings as ShapeTemplateFreeformSettings).nodes}
                        rules={new FieldValueValidation().IsArrayRequired(isFreeform, this.loc.ShapeGallery.Messages.FreefromShapeRequired).getRules()}>
                    </omfx-field-validation>
                    {this.editingShapeGalleryItem.settings.type && this.renderShapePreview(h)}

                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text loading={this.isSaving} onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.journey().travelBack(); }}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                    </div>
                </v-container>
                {this.isOpenMediaPicker && <ShapeGalleryMediaPickerComponent imageSaved={this.onImageSaved}
                    closed={() => { this.isOpenMediaPicker = false; }}></ShapeGalleryMediaPickerComponent>}
                {this.isOpenFreeformPicker && this.renderFreefromPicker(h)}
            </div>
        );
    }
}