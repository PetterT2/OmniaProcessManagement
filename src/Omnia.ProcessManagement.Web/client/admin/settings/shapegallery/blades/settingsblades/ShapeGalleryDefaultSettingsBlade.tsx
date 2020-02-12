import { Inject, Localize, Utils } from '@omnia/fx';
import { GuidValue, Guid } from '@omnia/fx-models';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase, FormValidator, FieldValueValidation, MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ShapeGalleryItemStore, IShape, DrawingCanvas, ShapeTemplatesConstants, TextSpacingWithShape } from '../../../../../fx';
import { ShapeGalleryJourneyStore } from '../../store';
import {
    ShapeGalleryItem, ShapeGalleryDefaultSettingStyles, CanvasDefinition, TextPosition, TextAlignment, DrawingShapeTypes, DrawingImageShapeDefinition, DrawingShape,
    DrawingShapeDefinition, ShapeGalleryItemFreeformSettings
} from '../../../../../fx/models';
import { OPMCoreLocalization } from '../../../../../core/loc/localize';
import './ShapeGalleryDefaultSettingsBlade.css';
import { MultilingualStore } from '@omnia/fx/store';
import { ShapeGalleryMediaPickerComponent } from '../../mediapicker/ShapeGalleryMediaPicker';

interface ShapeGalleryDefaultSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ShapeGalleryDefaultSettingsBlade extends VueComponentBase<ShapeGalleryDefaultSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ShapeGalleryJourneyStore) shapeGalleryJournayStore: ShapeGalleryJourneyStore;
    @Inject(ShapeGalleryItemStore) shapeGalleryStore: ShapeGalleryItemStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    shapeGalleryItemTypes = [
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
    editingShapeGalleryItem: ShapeGalleryItem = null;
    drawingCanvas: DrawingCanvas = null;
    selectedImage: MediaPickerImageTransformerProviderResult = null;
    internalValidator: FormValidator = new FormValidator(this);
    previewCanvasId: GuidValue = Guid.newGuid();
    isOpenMediaPicker: boolean = false;
    isOpenFreeformPicker: boolean = false;
    isSaving: boolean = false;

    created() {
        this.shapeGalleryItemTypes.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
        })

        this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();
        this.startToDrawShape();
    }

    destroyCanvas() {
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
            this.drawingCanvas = null;
        }  
    }

    onShapeGalleryItemTypeChanged() {
        this.destroyCanvas(); 
        (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingImageShapeDefinition).imageUrl = null;
        (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes = null;
    }

    drawFreeShape() {
        this.isOpenFreeformPicker = true;
    }

    onImageSaved(image: MediaPickerImageTransformerProviderResult) {
        this.selectedImage = image;
        (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingImageShapeDefinition).imageUrl = this.buildDataBlob(image.base64, image.format);
        if (this.drawingCanvas && this.drawingCanvas.drawingShapes.length > 0) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition),
                this.editingShapeGalleryItem.settings.title, false, 0,
                (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textPosition == TextPosition.Above ? (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).fontSize + TextSpacingWithShape : 0)
                .then((readyDrawingShape: DrawingShape) => {
                    this.updateAfterRenderImage(readyDrawingShape);
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

    updateAfterRenderImage(readyDrawingShape: DrawingShape) {
        this.drawingCanvas.updateCanvasSize(readyDrawingShape);
    }

    updateDrawedShape() {
        if (this.drawingCanvas && this.drawingCanvas.drawingShapes.length > 0) {
            let top = (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textPosition == TextPosition.Above ? (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).fontSize + TextSpacingWithShape : 0;
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition), this.editingShapeGalleryItem.settings.title, false, this.drawingCanvas.drawingShapes[0].shape.left || 0, top)
                .then((readyDrawingShape: DrawingShape) => {
                    if (readyDrawingShape && readyDrawingShape.shape.name == ShapeTemplatesConstants.Media.name)
                        this.updateAfterRenderImage(readyDrawingShape);
                    if (readyDrawingShape && readyDrawingShape.shape.name == ShapeTemplatesConstants.Freeform.name)
                        (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes = this.drawingCanvas.drawingShapes[0].shape.nodes;
                });
        }
    }

    addFreefromShape(shape: IShape) {
        this.isOpenFreeformPicker = false;
        if (shape != null) {
            (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).width = shape.nodes[0].properties['width'];
            (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).height = shape.nodes[0].properties['height'];
            (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes = shape.nodes;
            this.startToDrawShape();
        }
    }

    startToDrawShape() {
        if (this.editingShapeGalleryItem.settings.shapeDefinition) {
            setTimeout(() => {
                this.initDrawingCanvas();
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition),
                    this.editingShapeGalleryItem.settings.title, 0, 0, null, null,
                    (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes ? (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes : null)
                    .then((readyDrawingShape: DrawingShape) => {
                        this.updateAfterRenderImage(readyDrawingShape);
                    });
            }, 20);
        }
    }

    initDrawingCanvas() {
        this.destroyCanvas();
        this.drawingCanvas = new DrawingCanvas(this.previewCanvasId.toString(), {},
            {
                drawingShapes: [],
                width: 200,
                height: 200
            }, true, false);
    }

    save() {
        if (this.internalValidator.validateAll()) {
            this.isSaving = true;
            this.shapeGalleryStore.actions.addOrUpdateShapeGalleryItem.dispatch(this.editingShapeGalleryItem).then(() => {
                if ((this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Media.id.toString()) {
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
        return (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Media.id.toString() &&
            !(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingImageShapeDefinition).imageUrl ? true : false;
    }

    isNewFreeForm() {
        return (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Freeform.id.toString() &&
            (!(this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes || (this.editingShapeGalleryItem.settings as ShapeGalleryItemFreeformSettings).nodes.length == 0) ? true : false;
    }

    renderFreefromPicker(h) {
        var canvasDefinition: CanvasDefinition = {
            width: 200,
            height: 200,
            gridX: 10,
            gridY: 10,
            drawingShapes: []
        };

        return <opm-freeform-picker
            canvasDefinition={canvasDefinition}
            shapeDefinition={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition)}
            save={(shape: IShape) => { this.addFreefromShape(shape); }}
            closed={() => { this.isOpenFreeformPicker = false; }}
        ></opm-freeform-picker>
    }

    renderShapePreview(h) {
        let isFreeform = (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Freeform.id.toString();
        let isMedia = (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Media.id.toString();
        let renderCanvas = !this.isNewFreeForm() && !this.isNewMedia();

        return (
            <div class={this.styles.previewWrapper}>
                {
                    renderCanvas &&
                    <div class={this.styles.webkitScrollbar}>
                        <div class={this.styles.canvasPreviewWrapper}><canvas id={this.previewCanvasId.toString()}></canvas></div>
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
        let isMediaShape = (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate && (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate.id.toString() == ShapeTemplatesConstants.Media.id.toString();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{(this.editingShapeGalleryItem && this.editingShapeGalleryItem.id) ? this.editingShapeGalleryItem.multilingualTitle : this.loc.ShapeGallery.CreateShape}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    <v-row dense>
                        <v-col cols="6">
                            <omfx-multilingual-input
                                requiredWithValidator={this.internalValidator}
                                model={this.editingShapeGalleryItem.settings.title}
                                onModelChange={(title) => { this.editingShapeGalleryItem.settings.title = title; this.updateDrawedShape(); }}
                                forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
                            <v-select item-value="id" item-text="multilingualTitle" return-object items={this.shapeGalleryItemTypes} v-model={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate}
                                onChange={this.onShapeGalleryItemTypeChanged}></v-select>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                        <v-col cols="6">
                            {(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).shapeTemplate && this.renderShapePreview(h)}
                        </v-col>
                    </v-row>

                    <v-row dense align="center">
                        <v-col cols="6">
                            <v-select item-value="value" item-text="title" items={this.textPositions} label={this.coreLoc.DrawingShapeSettings.TextPosition}
                                onChange={this.updateDrawedShape} v-model={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textPosition}></v-select>
                            <v-select item-value="value" item-text="title" items={this.textAlignment} label={this.coreLoc.DrawingShapeSettings.TextAlignment}
                                onChange={this.updateDrawedShape} v-model={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textAlignment}></v-select>
                            <v-text-field v-model={(this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).fontSize} label={this.coreLoc.DrawingShapeSettings.FontSize}
                                onChange={this.updateDrawedShape} type="number" suffix="px"
                                rules={new FieldValueValidation().IsRequired().getRules()}></v-text-field>
                        </v-col>
                        <v-col cols="6" class="text-center">
                            <opm-point-picker
                                label={this.coreLoc.DrawingShapeSettings.TextAdjustment}
                                model={{ x: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textHorizontalAdjustment, y: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textVerticalAdjustment }}
                                onModelChange={(model) => {
                                    (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textHorizontalAdjustment = model.x;
                                    (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textVerticalAdjustment= model.y;
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
                                        label={this.omniaUxLoc.Common.BackgroundColor}
                                        model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).backgroundColor }}
                                        allowRgba
                                        onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).backgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaUxLoc.Common.BorderColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).borderColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).borderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.TextColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).textColor = p.color; this.updateDrawedShape(); }}>
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
                                        label={this.coreLoc.DrawingShapeSettings.HoverBackgroundColor}
                                        model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverBackgroundColor }}
                                        allowRgba
                                        onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverBackgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.HoverBorderColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverBorderColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.HoverTextColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverTextColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).hoverTextColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>

                    <v-row>
                        {
                            isMediaShape ? null :
                                <v-col cols="4">
                                    <omfx-color-picker
                                        dark={this.omniaTheming.promoted.body.dark}
                                        label={this.coreLoc.DrawingShapeSettings.SelectedBackgroundColor}
                                        model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedBackgroundColor }}
                                        allowRgba
                                        onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedBackgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.SelectedBorderColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedBorderColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.SelectedTextColor}
                                model={{ color: (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedTextColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShapeGalleryItem.settings.shapeDefinition as DrawingShapeDefinition).selectedTextColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>

                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text loading={this.isSaving} onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                    </div>
                </v-container>
                <div></div>
                {this.isOpenMediaPicker && <div><ShapeGalleryMediaPickerComponent imageSaved={this.onImageSaved}
                    closed={() => { this.isOpenMediaPicker = false; }}></ShapeGalleryMediaPickerComponent></div>}
                {this.isOpenFreeformPicker && this.renderFreefromPicker(h)}
            </div>
        );
    }
}