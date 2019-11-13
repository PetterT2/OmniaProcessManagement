import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';

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

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;


    created() {

    }

    render(h) {
        return (
            <div>
                {
                    //<v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    //    color={this.omniaTheming.promoted.header.background.base}
                    //    {
                    //    ...this.transformVSlot({
                    //        extension: () => {
                    //            return [
                    //                <v-tabs
                    //                    value={this.selectedTab}
                    //                    dark={this.omniaTheming.promoted.header.dark}
                    //                    background-color={this.omniaTheming.promoted.header.background.base}
                    //                    slider-color={this.omniaTheming.promoted.header.text.base}
                    //                >
                    //                    <v-tab onClick={() => { this.selectTab(TabNames.documentTemplate) }} >
                    //                        {this.loc.DocumentTemplates.Templates}
                    //                    </v-tab>
                    //                    <v-tab onClick={() => { this.selectTab(TabNames.categories) }}>
                    //                        {this.loc.DocumentTemplates.Categories}
                    //                    </v-tab>

                    //                </v-tabs>
                    //            ]
                    //        }
                    //    })}>
                    //    <v-toolbar-title>{this.loc.ProcessTemplates}</v-toolbar-title>
                    //    <v-spacer></v-spacer>
                    //</v-toolbar>
                    //<v-divider></v-divider>
                }
                
            </div>
        );
    }
}