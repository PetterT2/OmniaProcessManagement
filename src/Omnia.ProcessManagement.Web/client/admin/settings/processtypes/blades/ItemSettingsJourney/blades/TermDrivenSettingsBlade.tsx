import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { JourneyInstance, OmniaTheming, VueComponentBase, FormValidator, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessType, ProcessTypeItemSettings, TermDrivenPublishingApprovalSettings } from '../../../../../../fx/models';
import { ProcessTypeJourneyStore } from '../../../store';
import { ProcessTypeHelper } from '../../../core';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { GuidValue, TaxonomyPropertySettings } from '@omnia/fx-models';
import { TermStore, TermBase } from '@omnia/fx-sp';
import { TermDrivenNodeComponent } from './TermDrivenNodes/Node';
import { NodeStyles, NodeStylesInterface } from './TermDrivenNodes/Node.css';
import './TermDrivenNodes/Node.css';

interface TermDrivenSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class TermDrivenSettingsBlade extends VueComponentBase<TermDrivenSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) documentTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(TermStore) termStore: TermStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    nodeStyles = StyleFlow.use(NodeStyles) as NodeStylesInterface<string>;
    isLoading = true;
    termSetId: GuidValue = null;
    expandStatus: { [id: string]: boolean } = {};

    created() {
        this.loadAllTerms();
    }

    /**
     * We assumpt the termset using for term-drive will not be larged
     * So we load all the termset to easy to remove obsolete data if there is any term is deleted
     * */
    loadAllTerms() {
        let documentTypeItemSettings = this.documentTypeJourneyStore.getters.editingProcessType().settings as ProcessTypeItemSettings;
        let propertyId = (documentTypeItemSettings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings).taxonomyEnterprisePropertyDefinitionId;
        let taxonomyPropertySettings = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions().find(p => p.id == propertyId).settings as TaxonomyPropertySettings

        this.termSetId = taxonomyPropertySettings.termSetId;
        this.termStore.actions.ensureTermSetWithAllTerms.dispatch(this.termSetId).then(() => {
            let allTerms = this.termStore.getters.getAllTerms(this.termSetId);
            ProcessTypeHelper.ensureValidTermDriven(this.termSetId, allTerms);


            this.isLoading = false;
        })
    }


    renderTermDrivenSettings(h) {
        let termSet = this.termStore.getters.getTermSetById(this.termSetId);
        return (
            <TermDrivenNodeComponent dark={this.omniaTheming.promoted.body.dark}
                level={1}
                termNode={termSet}
                termSetId={this.termSetId}
                styles={this.nodeStyles}
                expandStatus={this.expandStatus}
            ></TermDrivenNodeComponent>
        )
    }

    render(h) {

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessTypes.Settings.PublishingApprovalTypes.TermDriven}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={() => { this.journey().travelBack() }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> : this.renderTermDrivenSettings(h)}
                </v-container>
            </div>
        );
    }
}


