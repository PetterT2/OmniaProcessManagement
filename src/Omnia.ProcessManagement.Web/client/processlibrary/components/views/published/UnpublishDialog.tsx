import Component from 'vue-class-component';
import { VueComponentBase, OmniaTheming, DialogPositions, DialogModel, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from '@omnia/fx/ux';
import { Process, OPMEnterprisePropertyInternalNames, ProcessTypeItemSettings, GlobalSettings } from '../../../../fx/models';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils } from '@omnia/fx';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { ProcessTypeStore, SettingsStore } from '../../../../fx';

interface UnpublishDialogProps {
    process: Process;
    closeCallback: () => void;
}

@Component
export class UnpublishDialog extends VueComponentBase<UnpublishDialogProps>
{
    @Prop() process: Process;
    @Prop() closeCallback: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(SettingsStore) settingsStore: SettingsStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);

    private dialogModel: DialogModel = { visible: false };

    private isLoading: boolean = false;
    private isUnpublishing: boolean = false;
    private canBeArchive: boolean = false;

    created() {
        this.dialogModel.visible = true;
    }

    mounted() {
        this.init();
    }

    private init() {
        this.isLoading = true;
        let processTypeId = this.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType];
        Promise.all([
            this.settingsStore.actions.ensureSettings.dispatch(GlobalSettings),
            this.processTypeStore.actions.ensureProcessTypes.dispatch([processTypeId])
        ]).then(() => {
            let processType = this.processTypeStore.getters.byId(processTypeId);
            let processTypeSettings = processType ? processType.settings as ProcessTypeItemSettings : null;
            let globalSettings = this.settingsStore.getters.getByModel(GlobalSettings);
            let defaultArchiveUrl = globalSettings ? globalSettings.archiveSiteUrl : "";
            this.canBeArchive = processTypeSettings && processTypeSettings.archive && (!Utils.isNullOrEmpty(processTypeSettings.archive.url) || !Utils.isNullOrEmpty(defaultArchiveUrl));
            this.isLoading = false;
        })
    }

    private unpublishDialogClose() {
        this.dialogModel.visible = false;
        if (this.closeCallback) this.closeCallback();
    }

    private unpublishProcess() {

    }

    renderHeader(h) {
        return (
            <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                <v-toolbar-title>{this.loc.ProcessActions.UnpublishProcess + " " + this.process.rootProcessStep.multilingualTitle}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={() => { this.unpublishDialogClose(); }}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
        )
    }

    private renderBody(h) {
        return (
            <v-container class={this.processLibraryClasses.centerDialogBody}>
                <span>{this.canBeArchive ? this.loc.Messages.ArchivePublishedProcessConfirmation : this.loc.Messages.DeletePublishedProcessConfirmation}</span>
            </v-container>
        )
    }

    private renderFooter(h) {
        return (
            <v-card-actions class={this.processLibraryClasses.dialogFooter}>
                <v-spacer></v-spacer>
                <v-btn
                    dark={!this.isLoading}
                    disabled={this.isLoading}
                    color={this.omniaTheming.themes.primary.base}
                    loading={this.isUnpublishing}
                    onClick={() => { this.unpublishProcess() }}>{this.loc.ProcessActions.Publish}
                </v-btn>
                <v-btn
                    disabled={this.isUnpublishing}
                    light={!this.omniaTheming.promoted.body.dark}
                    text
                    onClick={this.unpublishDialogClose}>{this.omniaUxLoc.Common.Buttons.Cancel}
                </v-btn>
            </v-card-actions>
        )
    }

    render(h) {
        return (
            <div>
                <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                    onClose={this.unpublishDialogClose}
                    hideCloseButton
                    model={this.dialogModel}
                    contentClass={this.omniaTheming.promoted.body.class}
                    width={'800px'}
                    position={DialogPositions.Center}>
                    <div>
                        {this.renderHeader(h)}
                        <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                            <div data-omfx>
                                {
                                    this.isLoading ?
                                        <v-skeleton-loader loading={true} height="100%" type="card"></v-skeleton-loader>
                                        :
                                        this.renderBody(h)
                                }
                            </div>
                            {this.renderFooter(h)}
                        </v-card>
                    </div>
                </omfx-dialog>
            </div>
        )
    }
}