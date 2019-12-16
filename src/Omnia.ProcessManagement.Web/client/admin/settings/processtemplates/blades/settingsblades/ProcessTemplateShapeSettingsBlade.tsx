import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes, DrawingShapeDefinition, TextPosition } from '../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../store';
import { ShapeTemplatesConstants } from '../../../../../fx/constants';
import { ProcessTemplatesJourneyBladeIds } from '../../ProcessTemplatesJourneyConstants';
import { MultilingualStore } from '@omnia/fx/store';
import { DrawingShapeTypes, ShapeTemplate } from '../../../../../fx/models/data/drawingdefinitions';
import { Guid } from '@omnia/fx-models';
import './ProcessTemplateShapeSettingsBlade.css';
import { ProcessTemplateShapeSettingsBladeStyles } from '../../../../../models';
import { classes } from 'typestyle';
import { DrawingCanvas } from '../../../../../fx/processshape';
import { OPMCoreLocalization } from '../../../../../core/loc/localize';

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
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
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
    canvasContainerId = "opm_template_canvas_container";
    canvasId: string = "opm_template_canvas";
    classes = StyleFlow.use(ProcessTemplateShapeSettingsBladeStyles);

    textPositions = [
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
    ]

    created() {
        this.shapeTemplateSelections.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
        })

        setTimeout(() => {
            this.editingShape = this.processTemplateJournayStore.getters.editingShapeDefinition();
            if (this.editingShape.type == ShapeDefinitionTypes.Drawing) {
                var canvasWidth = this.getCanvasContainerWidth();
                this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                    width: canvasWidth,
                    height: 230,
                    drawingShapes: []
                });
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null, false);
            }
        }, 500)
    }

    onShapeTemplateChanged() {
        this.editingShape.title = Utils.clone((this.editingShape as DrawingShapeDefinition).shapeTemplate.title);
        this.updateTemplateShape();
    }

    updateTemplateShape() {
        if (!this.drawingCanvas) {
            var canvasWidth = this.getCanvasContainerWidth();
            this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, {
                width: canvasWidth,
                height: 230,
                drawingShapes: []
            });
            this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.editingShape as DrawingShapeDefinition), null, false, 0, 0);
        }
        else {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0], (this.editingShape as DrawingShapeDefinition), null, false);
        }
    }

    getCanvasContainerWidth(): number {
        var containerElement = document.getElementById(this.canvasContainerId);
        return containerElement ? containerElement.clientWidth : 580;
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
            this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(editingProcessTemplate);

            this.journey().travelBack();
        }
    }

    needToShowShapeSettings(): boolean {
        return !(this.editingShape as DrawingShapeDefinition).shapeTemplate || ((this.editingShape as DrawingShapeDefinition).shapeTemplate &&
            (this.editingShape as DrawingShapeDefinition).shapeTemplate.name != ShapeTemplatesConstants.Freeform.name &&
            (this.editingShape as DrawingShapeDefinition).shapeTemplate.name != ShapeTemplatesConstants.Media.name);
    }

    renderDrawingSettings(h) {
        return (
            <div>
                <div class={this.classes.flexDisplay}>
                    <v-flex lg6>
                        <v-select item-value="id" item-text="multilingualTitle" return-object items={this.shapeTemplateSelections} v-model={(this.editingShape as DrawingShapeDefinition).shapeTemplate}
                            onChange={this.onShapeTemplateChanged}></v-select>
                        <omfx-field-validation
                            useValidator={this.internalValidator}
                            checkValue={(this.editingShape as DrawingShapeDefinition).shapeTemplate}
                            rules={new FieldValueValidation().IsRequired().getRules()}>
                        </omfx-field-validation>
                        {this.renderTitle(h)}
                    </v-flex>
                    <v-flex lg6 id={this.canvasContainerId} class={classes(this.needToShowShapeSettings() ? this.classes.shapePreviewContainer : this.classes.hidePreviewContainer, this.classes.contentPadding)}>
                        <canvas id={this.canvasId} width="100%" height="100%"></canvas>
                    </v-flex>
                </div>
                {
                    this.needToShowShapeSettings() &&
                    <div class={classes(this.classes.flexDisplay, this.classes.shapeSettingsContainer)}>
                        <v-flex lg6>
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
                                label={this.opmCoreloc.DrawingShapeSettings.TextColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).textColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).textColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                            <div class={this.classes.flexDisplay}>
                                <v-flex lg6>
                                    <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).width} label={this.opmCoreloc.DrawingShapeSettings.Width}
                                        onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                    <omfx-field-validation
                                        useValidator={this.internalValidator}
                                        checkValue={(this.editingShape as DrawingShapeDefinition).width}
                                        rules={new FieldValueValidation().IsRequired().getRules()}>
                                    </omfx-field-validation>
                                </v-flex>
                                <v-flex lg6 class={this.classes.contentPadding}>
                                    <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).height} label={this.opmCoreloc.DrawingShapeSettings.Height}
                                        onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                    <omfx-field-validation
                                        useValidator={this.internalValidator}
                                        checkValue={(this.editingShape as DrawingShapeDefinition).height}
                                        rules={new FieldValueValidation().IsRequired().getRules()}>
                                    </omfx-field-validation>
                                </v-flex>
                            </div>
                        </v-flex>
                        <v-flex lg6 class={this.classes.contentPadding}>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBackgroundColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).activeBackgroundColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBackgroundColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBorderColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).activeBorderColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBorderColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveTextColor}
                                model={{ color: (this.editingShape as DrawingShapeDefinition).activeTextColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeTextColor = p.color; this.updateTemplateShape(); }}>
                            </omfx-color-picker>
                            <div class={this.classes.flexDisplay}>
                                <v-flex lg6>
                                    <v-select item-value="value" item-text="title" items={this.textPositions} label={this.opmCoreloc.DrawingShapeSettings.TextPosition}
                                        onChange={this.updateTemplateShape} v-model={(this.editingShape as DrawingShapeDefinition).textPosition}></v-select>
                                    <omfx-field-validation
                                        useValidator={this.internalValidator}
                                        checkValue={(this.editingShape as DrawingShapeDefinition).textPosition}
                                        rules={new FieldValueValidation().IsRequired().getRules()}>
                                    </omfx-field-validation>
                                </v-flex>
                                <v-flex lg6 class={this.classes.contentPadding}>
                                    <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).fontSize} label={this.opmCoreloc.DrawingShapeSettings.FontSize}
                                        onChange={this.updateTemplateShape} type="number" suffix="px"></v-text-field>
                                    <omfx-field-validation
                                        useValidator={this.internalValidator}
                                        checkValue={(this.editingShape as DrawingShapeDefinition).fontSize}
                                        rules={new FieldValueValidation().IsRequired().getRules()}>
                                    </omfx-field-validation>
                                </v-flex>
                            </div>
                        </v-flex>
                    </div>
                }
            </div>
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