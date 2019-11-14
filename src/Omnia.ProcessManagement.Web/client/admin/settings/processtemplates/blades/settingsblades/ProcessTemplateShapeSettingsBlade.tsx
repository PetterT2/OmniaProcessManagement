import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes, DrawingShapeDefinition, HeadingShapeDefinition, TextPosition, ShapeTemplate } from '../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../store';
import { ShapeTemplatesConstants } from '../../../../../core';
import { MultilingualStore } from '@omnia/fx/store';

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

    private internalValidator: FormValidator = new FormValidator(this);
    private editingShape: ShapeDefinition = null;
    private editingShapeTitle: string = "";
    private editingShapeType: ShapeDefinitionTypes = null;
    private shapeTemplateSelections: Array<ShapeTemplate> = [
        ShapeTemplatesConstants.Circle,
        ShapeTemplatesConstants.Diamond,
        ShapeTemplatesConstants.Freeform,
        ShapeTemplatesConstants.Media,
        ShapeTemplatesConstants.Pentagon
    ];
    private selectedShapeTemplate: ShapeTemplate = null;

    private textPositions = [
        {
            value: TextPosition.Above,
            title: this.loc.ProcessTemplates.ShapeSettings.Above
        },
        {
            value: TextPosition.Center,
            title: this.loc.ProcessTemplates.ShapeSettings.Center
        },
        {
            value: TextPosition.Below,
            title: this.loc.ProcessTemplates.ShapeSettings.Below
        }
    ]

    created() {
        this.shapeTemplateSelections.forEach((shapeTemplateSelection) => {
            shapeTemplateSelection.multilingualTitle = this.multilingualStore.getters.stringValue(shapeTemplateSelection.title);
        })
    }

    onShapeTemplateChanged() {
        this.editingShape.title = Utils.clone(this.selectedShapeTemplate.title);
    }

    saveShape() {

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
                        <v-select item-value="id" item-text="multilingualTitle" return-object items={this.shapeTemplateSelections} v-model={this.selectedShapeTemplate}
                            onChange={this.onShapeTemplateChanged}></v-select>
                    }
                    {
                        this.editingShapeType == ShapeDefinitionTypes.Drawing &&
                        <div>
                            <v-flex lg4>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.omniaUxLoc.Common.BackgroundColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).backgroundColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).backgroundColor = p.color; }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.omniaUxLoc.Common.BorderColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).borderColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).borderColor = p.color; }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.TextColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).textColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).textColor = p.color; }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveBackgroundColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeBackgroundColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBackgroundColor = p.color; }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveBorderColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeBorderColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeBorderColor = p.color; }}>
                                </omfx-color-picker>
                                <omfx-color-picker
                                    dark={this.omniaTheming.promoted.body.dark}
                                    label={this.loc.ProcessTemplates.ShapeSettings.ActiveTextColor}
                                    model={{ color: (this.editingShape as DrawingShapeDefinition).activeTextColor }}
                                    disableRgba={true}
                                    onChange={(p) => { (this.editingShape as DrawingShapeDefinition).activeTextColor = p.color; }}>
                                </omfx-color-picker>
                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).width} label={this.loc.ProcessTemplates.ShapeSettings.Width}
                                    type="number" suffix="px"></v-text-field>
                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).height} label={this.loc.ProcessTemplates.ShapeSettings.Height}
                                    type="number" suffix="px"></v-text-field>
                                <v-select item-value="value" item-text="title" items={this.textPositions} label={this.loc.ProcessTemplates.ShapeSettings.TextPosition}
                                    v-model={(this.editingShape as DrawingShapeDefinition).textPosition}></v-select>
                                <v-text-field v-model={(this.editingShape as DrawingShapeDefinition).fontSize} label={this.loc.ProcessTemplates.ShapeSettings.FontSize}
                                    type="number" suffix="px"></v-text-field>
                            </v-flex>
                            <v-flex lg8>

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