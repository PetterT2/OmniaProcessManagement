import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes, DrawingShapeDefinition, TextPosition, TextAlignment, ShapeTemplate } from '../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../store';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../../../../fx/constants';
import { ProcessTemplatesJourneyBladeIds } from '../../ProcessTemplatesJourneyConstants';
import { MultilingualStore } from '@omnia/fx/store';
import { DrawingShapeTypes } from '../../../../../fx/models/data/drawingdefinitions';
import { Guid } from '@omnia/fx-models';
import './ProcessTemplateShapeSettingsBlade.css';
import { ProcessTemplateShapeSettingsBladeStyles } from '../../../../../models';
import { classes } from 'typestyle';
import { DrawingCanvas } from '../../../../../fx/processshape';
import { OPMCoreLocalization } from '../../../../../core/loc/localize';
import { ShapeTemplateStore, OPMUtils } from '../../../../../fx';

interface ProcessTemplateShapeSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ProcessTemplateShapeSettingsBlade extends VueComponentBase<ProcessTemplateShapeSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(ShapeTemplateStore) shapeTemplateStore: ShapeTemplateStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    internalValidator: FormValidator = new FormValidator(this);
    isLoading: boolean = false;
    editingShape: ShapeDefinition = null;
    editingShapeTitle: string = "";
    editingShapeType: ShapeDefinitionTypes = null;
    shapeTemplateSelections: Array<ShapeTemplate> = [
        ShapeTemplatesConstants.Circle,
        ShapeTemplatesConstants.Diamond,
        ShapeTemplatesConstants.Freeform,
        ShapeTemplatesConstants.Media,
        ShapeTemplatesConstants.Pentagon
    ];
    selectedShapeTemplate: ShapeTemplate = null;
    drawingCanvas: DrawingCanvas = null;
    canvasContainerId = "opm_template_canvas_container";
    canvasId: string = "opm_template_canvas";
    classes = StyleFlow.use(ProcessTemplateShapeSettingsBladeStyles);

    textPositions = [
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
    ]
    textAlignment = [
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

    created() {
        this.shapeTemplateSelections.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
        })

        this.isLoading = true;
        this.shapeTemplateStore.actions.ensureLoadShapeTemplates.dispatch().then(() => {
            this.isLoading = false;
            OPMUtils.waitForElementAvailable(this.$el, this.canvasId.toString()).then(() => {
                this.editingShape = this.processTemplateJournayStore.getters.editingShapeDefinition();
                if (this.editingShape.type == ShapeDefinitionTypes.Drawing) {
                    var canvasWidth = this.getCanvasContainerWidth();
                    this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                        width: canvasWidth,
                        height: 230,
                        drawingShapes: []
                    }, false);
                    this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null);
                }
            });
        })
    }

    onShapeTemplateChanged() {
        var foundTemplate = this.shapeTemplateStore.getters.shapeTemplates().find(i => i.id.toString() == (this.editingShape as DrawingShapeDefinition).shapeTemplateId.toString())
        if (foundTemplate) {
            (this.editingShape as DrawingShapeDefinition).shapeTemplateType = foundTemplate.settings.type;
            this.editingShape.title = Utils.clone(foundTemplate.title);
            this.updateTemplateShape();
        }
    }

    updateTemplateShape() {
        if (!this.drawingCanvas) {
            var canvasWidth = this.getCanvasContainerWidth();
            this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                width: canvasWidth,
                height: 230,
                drawingShapes: []
            });
            this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null, 0, 0);
        }
        else {
            let top = (this.editingShape as DrawingShapeDefinition).textPosition == TextPosition.Above ? (this.editingShape as DrawingShapeDefinition).fontSize + TextSpacingWithShape : 0;
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0].id, (this.editingShape as DrawingShapeDefinition), null, true, null, top);
        }
    }

    getCanvasContainerWidth(): number {
        var containerElement = document.getElementById(this.canvasContainerId);
        return containerElement ? containerElement.clientWidth : 580;
    }

    correctNumberField(editingProcessTemplate: ProcessTemplate) {
        editingProcessTemplate.settings.shapeDefinitions.forEach(s => {
            if ((s as DrawingShapeDefinition).width)
                (s as DrawingShapeDefinition).width = parseFloat((s as DrawingShapeDefinition).width.toString());
            if ((s as DrawingShapeDefinition).height)
                (s as DrawingShapeDefinition).height = parseFloat((s as DrawingShapeDefinition).height.toString());
            if ((s as DrawingShapeDefinition).fontSize)
                (s as DrawingShapeDefinition).fontSize = parseFloat((s as DrawingShapeDefinition).fontSize.toString());
        });
        return editingProcessTemplate;
    }

    saveShape() {
        if (this.internalValidator.validateAll()) {
            var editingProcessTemplate: ProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
            this.editingShape.multilingualTitle = this.multilingualStore.getters.stringValue(this.editingShape.title);
            if (Utils.isNullOrEmpty(this.editingShapeTitle)) {
                editingProcessTemplate.settings.shapeDefinitions = editingProcessTemplate.settings.shapeDefinitions ? editingProcessTemplate.settings.shapeDefinitions : [];
                editingProcessTemplate.settings.shapeDefinitions.push(this.editingShape);
            }
            else {
                var index = this.processTemplateJournayStore.getters.editingShapeDefinitionIndex();
                editingProcessTemplate.settings.shapeDefinitions[index] = this.editingShape;
            }
            this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(this.correctNumberField(editingProcessTemplate));

            this.journey().travelBack();
        }
    }

    needToShowShapeSettings(): boolean {
        return !(this.editingShape as DrawingShapeDefinition).shapeTemplateId || ((this.editingShape as DrawingShapeDefinition).shapeTemplateId &&
            (this.editingShape as DrawingShapeDefinition).shapeTemplateType != ShapeTemplatesConstants.Media.settings.type);
    }

    renderDrawingSettings(h) {
        return (
            <v-container fluid class="px-0">
                <div class={this.classes.flexDisplay}>
                    <v-flex lg6>
                        <v-select item-value="id" item-text="multilingualTitle" items={this.shapeTemplateSelections} v-model={(this.editingShape as DrawingShapeDefinition).shapeTemplateId}
                            onChange={this.onShapeTemplateChanged}></v-select>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).shapeTemplateId}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                        {this.renderTitle(h)}
                    </v-flex>
                    <v-flex lg6 id={this.canvasContainerId} class={classes(this.needToShowShapeSettings() ? this.classes.shapePreviewContainer : this.classes.hidePreviewContainer, this.classes.contentPadding)}>
                        <canvas id={this.canvasId} width="100%" height="100%"></canvas>
                    </v-flex>
                </div>

                <v-row>
                    <v-col cols="3">
                        <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).width} label={this.opmCoreloc.DrawingShapeSettings.Width}
                            onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).width}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).height} label={this.opmCoreloc.DrawingShapeSettings.Height}
                            onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).height}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                    </v-col>
                    <v-col cols="6">
                    </v-col>
                    <v-col cols="6">
                        <v-select item-value="value" item-text="title" items={this.textPositions} label={this.opmCoreloc.DrawingShapeSettings.TextPosition}
                            onChange={this.updateTemplateShape} v-model={(this.editingShape as DrawingShapeDefinition).textPosition}></v-select>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).textPosition}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                        <v-select item-value="value" item-text="title" items={this.textAlignment} label={this.opmCoreloc.DrawingShapeSettings.TextAlignment}
                            onChange={this.updateTemplateShape} v-model={(this.editingShape as DrawingShapeDefinition).textAlignment}></v-select>
                        <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).fontSize} label={this.opmCoreloc.DrawingShapeSettings.FontSize}
                            onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).fontSize}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                    </v-col>
                    <v-col cols="6" class="text-center">
                        <opm-point-picker
                            label={this.opmCoreloc.DrawingShapeSettings.TextAdjustment}
                            model={{ x: (this.editingShape as DrawingShapeDefinition).textHorizontalAdjustment, y: (this.editingShape as DrawingShapeDefinition).textVerticalAdjustment }}
                            onModelChange={(model) => {
                                (this.editingShape as DrawingShapeDefinition).textHorizontalAdjustment = model.x;
                                (this.editingShape as DrawingShapeDefinition).textVerticalAdjustment = model.y;
                                this.updateTemplateShape()
                            }}
                        ></opm-point-picker>
                    </v-col>
                </v-row>
                <v-row>
                    {
                        this.needToShowShapeSettings() &&
                        <v-col cols="4">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaUxLoc.Common.BackgroundColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).backgroundColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).backgroundColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    }
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            required={true}
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.omniaUxLoc.Common.BorderColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).borderColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).borderColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            required={true}
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.opmCoreloc.DrawingShapeSettings.TextColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).textColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).textColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                </v-row>

                <v-row>
                    {
                        this.needToShowShapeSettings() &&
                        <v-col cols="4">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.HoverBackgroundColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).hoverBackgroundColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).hoverBackgroundColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    }
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.opmCoreloc.DrawingShapeSettings.HoverBorderColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).hoverBorderColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).hoverBorderColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.opmCoreloc.DrawingShapeSettings.HoverTextColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).hoverTextColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).hoverTextColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                </v-row>

                <v-row>
                    {
                        this.needToShowShapeSettings() &&
                        <v-col cols="4">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.SelectedBackgroundColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).selectedBackgroundColor }}
                                allowRgba
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).selectedBackgroundColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    }
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.opmCoreloc.DrawingShapeSettings.SelectedBorderColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).selectedBorderColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).selectedBorderColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                    <v-col cols={this.needToShowShapeSettings() ? "4" : "6"}>
                        <omfx-color-picker
                            dark={this.omniaTheming.promoted.body.dark}
                            label={this.opmCoreloc.DrawingShapeSettings.SelectedTextColor}
                            model={{ color: (this.editingShape as DrawingShapeDefinition).selectedTextColor }}
                            allowRgba
                            onChange={(p) => { (this.editingShape as DrawingShapeDefinition).selectedTextColor = p.color; this.updateTemplateShape(); }}>
                        </omfx-color-picker>
                    </v-col>
                </v-row>
            </v-container>
        )
    }

    renderTitle(h) {
        return (
            <omfx-multilingual-input
                requiredWithValidator={this.internalValidator}
                model={this.editingShape.title}
                onModelChange={(title) => { this.editingShape.title = title }}
                forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
        )
    }

    render(h) {
        this.editingShape = this.processTemplateJournayStore.getters.editingShapeDefinition();
        this.editingShapeTitle = this.processTemplateJournayStore.getters.editingShapeDefinitionTitle();
        this.editingShapeType = this.processTemplateJournayStore.getters.editingShapeDefinitionType();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{!Utils.isNullOrEmpty(this.editingShapeTitle) ?
                        (this.omniaUxLoc.Common.Buttons.Edit + " " + this.editingShapeTitle) :
                        (this.editingShapeType == ShapeDefinitionTypes.Heading ? this.loc.ProcessTemplates.AddHeading : this.loc.ProcessTemplates.AddShape)}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {
                        this.editingShapeType == ShapeDefinitionTypes.Heading ?
                            this.renderTitle(h)
                            :
                            this.renderDrawingSettings(h)
                    }
                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={this.saveShape}>{this.omniaUxLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.journey().travelBack(); }}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                    </div>
                </v-container>
            </div>
        );
    }
}