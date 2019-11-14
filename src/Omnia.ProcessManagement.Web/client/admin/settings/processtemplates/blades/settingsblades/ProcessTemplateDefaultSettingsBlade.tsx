﻿import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import ProcessTemplatSettingsGeneralTab from './tabs/ProcessTemplatSettingsGeneralTab';
import ProcessTemplatSettingsDefaultContentTab from './tabs/ProcessTemplatSettingsDefaultContentTab';
import ProcessTemplatSettingsShapesTab from './tabs/ProcessTemplatSettingsShapesTab';
import { ProcessTemplate } from '../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../store';
import { ProcessTemplatesJourneyBladeIds } from '../../ProcessTemplatesJourneyConstants';

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

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private selectedTab: number = TabNames.general;
    private editingProcessTemplate: ProcessTemplate = null;

    created() {
        this.editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
    }

    selectTab(selectedTab: number) {
        this.selectedTab = selectedTab;
        this.journey().travelBackToFirstBlade();
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
    }

    render(h) {
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
                                    <v-tab onClick={() => { this.selectTab(TabNames.defaultContent) }}>
                                        {this.loc.ProcessTemplates.SettingsTabs.DefaultContent}
                                    </v-tab>
                                </v-tabs>
                            ]
                        }
                    })}>
                    <v-toolbar-title>{(this.editingProcessTemplate && this.editingProcessTemplate.id) ? this.editingProcessTemplate.multilingualTitle : this.loc.ProcessTemplates.CreateProcessTemplate}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {this.selectedTab == TabNames.general && <ProcessTemplatSettingsGeneralTab journey={this.journey}></ProcessTemplatSettingsGeneralTab>}
                    {this.selectedTab == TabNames.shapes && <ProcessTemplatSettingsShapesTab journey={this.journey}></ProcessTemplatSettingsShapesTab>}
                    {this.selectedTab == TabNames.defaultContent && <ProcessTemplatSettingsDefaultContentTab journey={this.journey}></ProcessTemplatSettingsDefaultContentTab>}
                </v-container>
            </div>
        );
    }
}