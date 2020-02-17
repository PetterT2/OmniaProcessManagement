import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject, Utils } from "@omnia/fx";
import { Prop } from 'vue-property-decorator'
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogPositions, StyleFlow, VueComponentBase, HeadingStyles, DialogStyles, DialogModel } from '@omnia/fx/ux';
import './UnpublishProcessDialog.css';
import { IUnpublishProcessDialog } from './IUnpublishProcessDialog';
import { Process, UnpublishProcessDialogStyles, OPMEnterprisePropertyInternalNames, GlobalSettings, ProcessTypeItemSettings, ProcessVersionType } from '../../fx/models';
import { ProcessTypeStore, SettingsStore, ProcessService, UnpublishProcessService } from '../../fx';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { InternalOPMTopics } from '../../fx/messaging/InternalOPMTopics';

@Component
export default class UnpublishProcessDialog extends VueComponentBase implements IWebComponentInstance, IUnpublishProcessDialog {

    @Prop() process: Process;
    @Prop() closeCallback: (unpublished: boolean) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(SettingsStore) settingsStore: SettingsStore;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(UnpublishProcessService) unpublishProcessService: UnpublishProcessService;

    
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) loc: OPMCoreLocalization.locInterface;
    private styleClasses = StyleFlow.use(UnpublishProcessDialogStyles);

    private dialogModel: DialogModel = { visible: false };

    private isLoading: boolean = false;
    private isUnpublishing: boolean = false;
    private canBeArchive: boolean = false;
    private allowToUnpublish: boolean = true;
    private hasError: boolean = false;
    private errorMsg: string = "";

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
            this.processService.checkIfDraftExists(this.process.opmProcessId.toString()),
            this.settingsStore.actions.ensureSettings.dispatch(GlobalSettings),
            this.processTypeStore.actions.ensureProcessTypes.dispatch([processTypeId])
        ]).then((result) => {
            if (result[0]) {
                this.hasError = true;
                this.errorMsg = this.loc.Messages.MessageDraftExistCannotBeArchived;
            }
            else {
                let processType = this.processTypeStore.getters.byId(processTypeId);
                let processTypeSettings = processType ? processType.settings as ProcessTypeItemSettings : null;
                let globalSettings = this.settingsStore.getters.getByModel(GlobalSettings);
                let defaultArchiveUrl = globalSettings ? globalSettings.archiveSiteUrl : "";
                this.canBeArchive = processTypeSettings && processTypeSettings.archive && (!Utils.isNullOrEmpty(processTypeSettings.archive.url) || !Utils.isNullOrEmpty(defaultArchiveUrl));
            }
            this.isLoading = false;
        })
    }

    private unpublishDialogClose(unpublished: boolean = null) {
        this.dialogModel.visible = false;
        if (this.closeCallback) this.closeCallback(unpublished);
    }

    private unpublishProcess() {
        this.isUnpublishing = true;
        this.unpublishProcessService.unpublishProcess(this.process.opmProcessId.toString()).then((data) => {
            this.unpublishDialogClose(true);
        })
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
            <v-container class={this.styleClasses.centerDialogBody}>
                {
                    !this.hasError ?
                        <span>{this.canBeArchive ? this.loc.Messages.ArchivePublishedProcessConfirmation : this.loc.Messages.DeletePublishedProcessConfirmation}</span>
                        :
                        <span>{this.errorMsg}</span>
                }

            </v-container>
        )
    }

    private renderFooter(h) {
        return (
            <v-card-actions class={this.styleClasses.dialogFooter}>
                <v-spacer></v-spacer>
                <v-btn
                    dark={!(this.isLoading || !this.allowToUnpublish)}
                    disabled={this.isLoading || !this.allowToUnpublish || this.hasError}
                    color={this.omniaTheming.themes.primary.base}
                    loading={this.isUnpublishing}
                    onClick={() => { this.unpublishProcess(); }}>{this.loc.ProcessActions.UnpublishProcess}
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
                    width={'600px'}
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

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, UnpublishProcessDialog);
});

