import { Inject, Localize } from '@omnia/fx';
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

interface ProcessTemplateShapeSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ProcessTemplateShapeSettingsBlade extends VueComponentBase<ProcessTemplateShapeSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private editingShape: any = null;

    created() {
        this.editingShape = this.processTemplateJournayStore.getters.editingProcessTemplateShapeItem();
    }

    render(h) {
        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{(this.editingShape && this.editingShape.id) ? this.omniaUxLoc.Common.Buttons.Edit + " " + this.editingShape.multilingualTitle : this.loc.ProcessTemplates.AddShape}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
            </div>
        );
    }
}