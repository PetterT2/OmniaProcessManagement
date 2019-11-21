/// <reference path="../../../../../fx/models/data/processtemplates/processtemplatesettings.ts" />
import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes, DrawingShapeDefinition, HeadingShapeDefinition, TextPosition, ShapeTemplate } from '../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../store';
import { ShapeTemplatesConstants } from '../../../../../fx/constants';
import { DrawingCanvas, DrawingCanvasEditor } from '../../../../../fx/models/processshape/canvas';
import { ProcessTemplatesJourneyBladeIds } from '../../ProcessTemplatesJourneyConstants';
import { MultilingualStore } from '@omnia/fx/store';
import { DrawingShapeTypes } from '../../../../../fx/models/data/drawingdefinitions';
import { Guid } from '@omnia/fx-models';

interface ProcessTemplateShapeSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ProcessTemplateShapeSettingsBlade extends VueComponentBase<ProcessTemplateShapeSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    internalValidator: FormValidator = new FormValidator(this);
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
    canvasId: string = "opm_template_canvas";

    textPositions = [
        {
            value: TextPosition.Above,
            title: this.loc.ProcessTemplates.ShapeSettings.Above
        },
        {
            value: TextPosition.Center,
            title: this.loc.ProcessTemplates.ShapeSettings.Center
        },
        {
            value: TextPosition.Bottom,
            title: this.loc.ProcessTemplates.ShapeSettings.Below
        }
    ]

    created() {
        this.shapeTemplateSelections.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
        })

        setTimeout(() => {
            this.editingShapeTitle = this.processTemplateJournayStore.getters.editingShapeDefinitionTitle();
            if (!Utils.isNullOrEmpty(this.editingShapeTitle) && this.editingShape.type == ShapeDefinitionTypes.Drawing) {
                this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                    width: 400,
                    height: 500,
                    drawingShapes: []
                });
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null, false, '', 50, 50);
            }
        }, 500)
    }

    onShapeTemplateChanged() {
        this.editingShape.title = Utils.clone((this.editingShape as DrawingShapeDefinition).shapeTemplate.title);
        this.updateTemplateShape();
    }

    updateTemplateShape() {
        if (!this.drawingCanvas) {
            this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                width: 400,
                height: 500,
                drawingShapes: []
            });
            this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null, false, '', 0, 0);
        }
        else {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0], (this.editingShape as DrawingShapeDefinition), false, "");
        }
    }

    saveShape() {
        debugger;
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
            this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(editingProcessTemplate);

            this.journey().travelBackToFirstBlade();
            this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
        }
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
                    <omfx-multilingual-input
                        requiredWithValidator={this.internalValidator}
                        model={this.editingShape.title}
                        onModelChange={(title) => { this.editingShape.title = title }}
                        forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
                    {
                        this.editingShapeType == ShapeDefinitionTypes.Drawing &&
                        [
                            <v-select item-value="id" item-text="multilingualTitle" return-object items={this.shapeTemplateSelections} v-model={(this.editingShape as DrawingShapeDefinition).shapeTemplate}
                                onChange={this.onShapeTemplateChanged}></v-select>,
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.editingShape as DrawingShapeDefinition).shapeTemplate}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        ]
                    }
                    {
                        this.editingShapeType == ShapeDefinitionTypes.Drawing && (!(this.editingShape as DrawingShapeDefinition).shapeTemplate || ((this.editingShape as DrawingShapeDefinition).shapeTemplate &&
                        (this.editingShape as DrawingShapeDefinition).shapeTemplate.id != ShapeTemplatesConstants.Media.id &&
                        (this.editingShape as DrawingShapeDefinition).shapeTemplate.id != ShapeTemplatesConstants.Freeform.id)) &&
                        <div style={{ display: "flex" }}>
                            <v-flex lg4>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.omniaUxLoc.Common.BackgroundColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).backgroundColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).backgroundColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.omniaUxLoc.Common.BorderColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).borderColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).borderColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.TextColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).textColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).textColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveBackgroundColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeBackgroundColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBackgroundColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveBorderColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeBorderColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBorderColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    required={true}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveTextColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeTextColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeTextColor = p.color; this.updateTemplateShape(); }}>
                                </omfx-color-picker>

                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).width} label={this.loc.ProcessTemplates.ShapeSettings.Width}
                                    onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                <omfx-field-validation
                                    useValidator={this.internalValidator}
                                    checkValue={(this.editingShape as DrawingShapeDefinition).width}
                                    rules={new FieldValueValidation().IsRequired().getRules()}>
                                </omfx-field-validation>

                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).height} label={this.loc.ProcessTemplates.ShapeSettings.Height}
                                    onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                <omfx-field-validation
                                    useValidator={this.internalValidator}
                                    checkValue={(this.editingShape as DrawingShapeDefinition).height}
                                    rules={new FieldValueValidation().IsRequired().getRules()}>
                                </omfx-field-validation>

                                <v-select item-value="value" item-text="title" items={this.textPositions} label={this.loc.ProcessTemplates.ShapeSettings.TextPosition}
                                    onChange={this.updateTemplateShape} v-model={(this.editingShape as DrawingShapeDefinition).textPosition}></v-select>
                                <omfx-field-validation
                                    useValidator={this.internalValidator}
                                    checkValue={(this.editingShape as DrawingShapeDefinition).textPosition}
                                    rules={new FieldValueValidation().IsRequired().getRules()}>
                                </omfx-field-validation>

                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).fontSize} label={this.loc.ProcessTemplates.ShapeSettings.FontSize}
                                    onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                <omfx-field-validation
                                    useValidator={this.internalValidator}
                                    checkValue={(this.editingShape as DrawingShapeDefinition).fontSize}
                                    rules={new FieldValueValidation().IsRequired().getRules()}>
                                </omfx-field-validation>

                            </v-flex>
                            <v-flex lg8 style={{ paddingLeft: '15px' }}>
                                <canvas id={this.canvasId} width="100%" height="100%"></canvas>
                            </v-flex>
                        </div>
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