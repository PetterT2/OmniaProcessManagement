import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, VueComponentBase, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ProcessTemplateStore } from '../../../../stores';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypesJourneyBladeIds } from '../ProcessTypesJourneyConstants';
import { ProcessTemplate, ProcessTemplateFactory } from '../../../../fx/models';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(ProcessTypeJourneyStore) processTypeJournayStore: ProcessTypeJourneyStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = false;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};

    created() {
        this.isLoading = true;
        Promise.all([
            this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch()]
        ).then(() => {
            this.isLoading = false;
        })
    }

    //travelToEdit(template: ProcessTemplate) {
    //    this.openSettingBlade(Utils.clone(template));
    //}

    //openSettingBlade(template?: ProcessTemplate) {
    //    this.journey().travelBackToFirstBlade();
    //    this.$nextTick(() => {
    //        let processTemplate = template || ProcessTemplateFactory.createDefaultProcessTemplate();
    //        this.processTypeJournayStore.mutations.setEditingProcessTemplate.commit(processTemplate);
    //        this.journey().travelToNext(ProcessTypesJourneyBladeIds.processTemplateSettingsDefault);
    //    });
    //}

    

    render(h) {
        if (this.isLoading)
            return (<div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>)

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessTemplates.Title}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    
                </v-container>
            </div>
        );
    }
}