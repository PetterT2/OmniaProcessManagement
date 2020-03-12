import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase, FormValidator } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import ProcessTemplatSettingsGeneralTab from './tabs/ProcessTemplatSettingsGeneralTab';
import ProcessTemplatSettingsDefaultContentTab from './tabs/ProcessTemplatSettingsDefaultContentTab';
import ProcessTemplatSettingsShapesTab from './tabs/ProcessTemplatSettingsShapesTab';
import { ProcessTemplate } from '../../../../../fx/models';
import { ProcessTemplatesJourneyBladeIds } from '../../ProcessTemplatesJourneyConstants';
import { ProcessTemplateStore } from '../../../../../fx';
import { ProcessTemplateJourneyStore } from '../../store';

interface ProcessTemplateDefaultSettingsBladeProps {
    journey: () => JourneyInstance;
}

const TabNames = {
    general: 0,
    shapes: 1,
    defaultContent: 2
}

@Component
export default class ProcessTemplateDefaultSettingsBlade extends VueComponentBase<ProcessTemplateDefaultSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    selectedTab: number = TabNames.general;
    editingProcessTemplate: ProcessTemplate = null;
    internalValidator: FormValidator = new FormValidator(this);
    isSaving: boolean = false;

    created() {
        
    }

    selectTab(selectedTab: number) {
        this.selectedTab = selectedTab;
    }

    save() {
        if (this.internalValidator.validateAll()) {
            this.isSaving = true;
            this.editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
            this.processTemplateStore.actions.addOrUpdateProcessTemplate.dispatch(this.editingProcessTemplate).then(() => {
                this.isSaving = false;
                this.journey().travelBackToFirstBlade();
            })
        }
        else {
            this.selectedTab = TabNames.general;
        }
    }

    render(h) {
        this.editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}
                    {
                    ...this.transformVSlot({
                        extension: () => {
                            return [
                                <v-tabs
                                    value={this.selectedTab}
                                    dark={this.omniaTheming.promoted.header.dark}
                                    background-color={this.omniaTheming.promoted.header.background.base}
                                    slider-color={this.omniaTheming.promoted.header.text.base}
                                >
                                    <v-tab onClick={() => { this.selectTab(TabNames.general) }} >
                                        {this.loc.ProcessTemplates.SettingsTabs.General}
                                    </v-tab>
                                    <v-tab onClick={() => { this.selectTab(TabNames.shapes) }}>
                                        {this.loc.ProcessTemplates.SettingsTabs.Shapes}
                                    </v-tab>
                                    {
                                        //<v-tab onClick={() => { this.selectTab(TabNames.defaultContent) }}>
                                        //    {this.loc.ProcessTemplates.SettingsTabs.DefaultContent}
                                        //</v-tab>
                                    }
                                    
                                </v-tabs>
                            ]
                        }
                    })}>
                    <v-toolbar-title>{(this.editingProcessTemplate && this.editingProcessTemplate.id) ? this.editingProcessTemplate.multilingualTitle : this.loc.ProcessTemplates.CreateProcessTemplate}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={() => { this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(null) }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    <div v-show={this.selectedTab == TabNames.general}>
                        <ProcessTemplatSettingsGeneralTab journey={this.journey} editingProcessTemplate={this.editingProcessTemplate} formValidator={this.internalValidator}></ProcessTemplatSettingsGeneralTab>
                    </div>
                    <div v-show={this.selectedTab == TabNames.shapes}>
                        <ProcessTemplatSettingsShapesTab journey={this.journey} editingProcessTemplate={this.editingProcessTemplate}></ProcessTemplatSettingsShapesTab>
                    </div>
                    <div v-show={this.selectedTab == TabNames.defaultContent}>
                        <ProcessTemplatSettingsDefaultContentTab journey={this.journey} editingProcessTemplate={this.editingProcessTemplate}></ProcessTemplatSettingsDefaultContentTab>
                    </div>
                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text loading={this.isSaving} onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                    </div>
                </v-container>
            </div>
        );
    }
}