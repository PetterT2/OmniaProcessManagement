import { Inject, Localize, Utils } from '@omnia/fx';
import { GuidValue, Guid } from '@omnia/fx-models';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ShapeGalleryItemStore, IShape, DrawingCanvas } from '../../../../../fx';
import { ShapeGalleryJourneyStore } from '../../store';
import { ShapeGalleryItem, ShapeGalleryItemType, ShapeGalleryDefaultSettingStyles, CanvasDefinition, TextPosition, TextAlignment, DrawingShapeTypes } from '../../../../../fx/models';
import { OPMCoreLocalization } from '../../../../../core/loc/localize';
import './ShapeGalleryDefaultSettingsBlade.css';

interface ShapeGalleryDefaultSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ShapeGalleryDefaultSettingsBlade extends VueComponentBase<ShapeGalleryDefaultSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ShapeGalleryJourneyStore) shapeGalleryJournayStore: ShapeGalleryJourneyStore;
    @Inject(ShapeGalleryItemStore) shapeGalleryStore: ShapeGalleryItemStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    shapeGalleryItemTypes = [
        {
            id: ShapeGalleryItemType.Freeform,
            title: this.coreLoc.ShapeNames.Freeform
        },
        {
            id: ShapeGalleryItemType.Media,
            title: this.coreLoc.ShapeNames.Media
        }
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
    shape: IShape = null;
    internalValidator: FormValidator = new FormValidator(this);
    previewCanvasId: GuidValue = Guid.newGuid();
    isOpenMediaPicker: boolean = false;
    isOpenFreeformPicker: boolean = false;
    isSaving: boolean = false;

    created() {

    }

    onShapeGalleryItemTypeChanged() {

    }

    drawFreeShape() {
        this.isOpenFreeformPicker = true;
    }

    onImageSaved() {

    }

    updateDrawedShape() {

    }

    addFreefromShape(shape: IShape) {
        this.isOpenFreeformPicker = false;
        if (shape != null) {
            this.shape = shape;
            this.editingShapeGalleryItem.settings.shapeDefinition.width = this.shape.nodes[0].properties['width'];
            this.editingShapeGalleryItem.settings.shapeDefinition.height = this.shape.nodes[0].properties['height'];
            this.startToDrawShape();
        }
    }

    startToDrawShape() {
        if (this.editingShapeGalleryItem.settings.shapeDefinition) {
            this.$nextTick(() => {
                this.initDrawingCanvas();
                //if (!this.isNewMedia())
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, this.editingShapeGalleryItem.settings.shapeDefinition,
                    this.editingShapeGalleryItem.settings.title, 0, 0);
            });
        }
    }

    initDrawingCanvas() {
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();

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
            this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();
            this.shapeGalleryStore.actions.addOrUpdateShapeGalleryItem.dispatch(this.editingShapeGalleryItem).then(() => {
                this.isSaving = false;
                this.journey().travelBackToFirstBlade();
            })
        }
    }

    isNewMedia() {
        return true;
    }

    isNewFreeForm() {
        return true;
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
            shapeDefinition={this.editingShapeGalleryItem.settings.shapeDefinition}
            save={(shape: IShape) => { this.addFreefromShape(shape); }}
            closed={() => { this.isOpenFreeformPicker = false; }}
        ></opm-freeform-picker>
    }

    renderShapePreview(h) {
        let isFreeform = this.editingShapeGalleryItem.settings.type == ShapeGalleryItemType.Freeform;
        let isMedia = this.editingShapeGalleryItem.settings.type == ShapeGalleryItemType.Media;
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
        let isMediaShape = this.editingShapeGalleryItem.settings.type && this.editingShapeGalleryItem.settings.type == ShapeGalleryItemType.Media;

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
                                onModelChange={(title) => { this.editingShapeGalleryItem.settings.title = title }}
                                forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
                            <v-select item-value="id" item-text="title" items={this.shapeGalleryItemTypes} v-model={this.editingShapeGalleryItem.settings.type}
                                onChange={this.onShapeGalleryItemTypeChanged}></v-select>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={this.editingShapeGalleryItem.settings.type}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                        <v-col cols="6">
                            {this.editingShapeGalleryItem.settings.type && this.renderShapePreview(h)}
                        </v-col>
                    </v-row>

                    <v-row dense>
                        <v-col cols="4">
                            <v-select item-value="value" item-text="title" items={this.textPositions} label={this.coreLoc.DrawingShapeSettings.TextPosition}
                                onChange={this.updateDrawedShape} v-model={this.editingShapeGalleryItem.settings.shapeDefinition.textPosition}></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-select item-value="value" item-text="title" items={this.textAlignment} label={this.coreLoc.DrawingShapeSettings.TextAlignment}
                                onChange={this.updateDrawedShape} v-model={this.editingShapeGalleryItem.settings.shapeDefinition.textAlignment}></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model={this.editingShapeGalleryItem.settings.shapeDefinition.fontSize} label={this.coreLoc.DrawingShapeSettings.FontSize}
                                onChange={this.updateDrawedShape} type="number" suffix="px"
                                rules={new FieldValueValidation().IsRequired().getRules()}></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model={this.editingShapeGalleryItem.settings.shapeDefinition.textHorizontalAdjustment} label={this.coreLoc.DrawingShapeSettings.TextHorizontalAdjustment}
                                onChange={(val) => { this.editingShapeGalleryItem.settings.shapeDefinition.textHorizontalAdjustment = val ? parseInt(val) : 0; this.updateDrawedShape(); }} type="number" suffix="px"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model={this.editingShapeGalleryItem.settings.shapeDefinition.textVerticalAdjustment} label={this.coreLoc.DrawingShapeSettings.TextVerticalAdjustment}
                                onChange={(val) => { this.editingShapeGalleryItem.settings.shapeDefinition.textVerticalAdjustment = val ? parseInt(val) : 0; this.updateDrawedShape(); }} type="number" suffix="px"></v-text-field>
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
                                        model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.backgroundColor }}
                                        allowRgba
                                        onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.backgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaUxLoc.Common.BorderColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.borderColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.borderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.TextColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.textColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.textColor = p.color; this.updateDrawedShape(); }}>
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
                                        model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.hoverBackgroundColor }}
                                        allowRgba
                                        onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.hoverBackgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.HoverBorderColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.hoverBorderColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.hoverBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.HoverTextColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.hoverTextColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.hoverTextColor = p.color; this.updateDrawedShape(); }}>
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
                                        model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.selectedBackgroundColor }}
                                        allowRgba
                                        onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.selectedBackgroundColor = p.color; this.updateDrawedShape(); }}>
                                    </omfx-color-picker>
                                </v-col>
                        }
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.SelectedBorderColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.selectedBorderColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.selectedBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols={isMediaShape ? "6" : "4"}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.coreLoc.DrawingShapeSettings.SelectedTextColor}
                                model={{ color: this.editingShapeGalleryItem.settings.shapeDefinition.selectedTextColor }}
                                allowRgba
                                onChange={(p) => { this.editingShapeGalleryItem.settings.shapeDefinition.selectedTextColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>

                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text loading={this.isSaving} onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                    </div>
                </v-container>
                {this.isOpenMediaPicker && <opm-media-picker onImageSaved={this.onImageSaved} onClosed={() => { this.isOpenMediaPicker = false; }}></opm-media-picker>}
                {this.isOpenFreeformPicker && this.renderFreefromPicker(h)}
            </div>
        );
    }
}