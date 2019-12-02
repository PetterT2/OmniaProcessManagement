import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, VueComponentBase, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypeStore } from '../../../../fx';
import { AdminJourneyStore } from '../../../store';
import { ProcessTypeTermSynchronizationStatusStatuses } from '../../../../fx/models';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(AdminJourneyStore) adminJourneyStore: AdminJourneyStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = false;
    termSetFound: boolean = false;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};

    created() {
        //this.isLoading = true;
        //Promise.all([
        //    this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch()]
        //).then(() => {
        //    this.isLoading = false;
        //})
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

    renderProcessTypesTree(h) {
        //let rootDocumentType = this.documentTypeStore.getters.rootDocumentTypeInGlobalSettings();
        //return <Node currentIndexInSiblings={0} siblingsCount={1} dark={this.omniaTheming.promoted.body.dark} styles={this.nodeStyles} documentType={rootDocumentType} level={1}></Node>
    }

    render(h) {
        let status = this.processTypeJourneyStore.getters.syncStatus();
        let syncingFromSharePoint = status && status.syncFromSharePoint && status.status == ProcessTypeTermSynchronizationStatusStatuses.Syncing;

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessTypes.Title}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    {
                        //status ? [
                        //    <v-btn icon onClick={() => { this.openSyncStatusBlade(); }}>
                        //        <v-icon color={status.status == DocumentTypeTermSynchronizationStatusStatuses.Failed ? "red" : ""}>fa fa-info-circle</v-icon>
                        //    </v-btn>
                        //] : null
                    }
                    <v-btn icon onClick={() => { this.adminJourneyStore.mutations.setActiveSubMenuItem.commit(null) }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {
                        this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                            !this.termSetFound ? this.loc.ProcessTypes.Messages.ProcessTypesTermSetNotFound :
                                syncingFromSharePoint ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                                    this.renderProcessTypesTree(h)
                    }
                </v-container>
            </div>
        );
    }
}