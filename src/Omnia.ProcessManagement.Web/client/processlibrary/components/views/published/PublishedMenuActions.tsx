import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { Process, Enums, ProcessWorkingStatus } from '../../../../fx/models';
import { UnpublishDialog } from './UnpublishDialog';
import { ProcessStore, OPMUtils, OPMRouter } from '../../../../fx';
import { ProcessLibraryListViewTabs } from '../../../Constants';

interface PublishedMenuActionsProps {
    closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    process: DisplayProcess;
    isAuthor: boolean;
    viewPageUrl: string;
}

@Component
export class PublishedMenuActions extends VueComponentBase<PublishedMenuActionsProps> implements IWebComponentInstance {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    @Prop() process: DisplayProcess;
    @Prop() isAuthor: boolean;
    @Prop() viewPageUrl: string;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(ProcessStore) processStore: ProcessStore;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    disableButtonUpdateAction: boolean = false;
    openUnpublishDialog: boolean = false;
    openProcessHistoryDialog: boolean = false;

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    private createDraft() {
        this.processStore.actions.createDraftFromPublished.dispatch(this.process.opmProcessId).then(() => {
            this.closeCallback(false, ProcessLibraryListViewTabs.Draft);
        })
    }

    private viewProcess() {
        if (this.viewPageUrl) {
            var viewUrl = OPMUtils.createProcessNavigationUrl(this.process.rootProcessStep.id, this.viewPageUrl, false, false);
            var win = window.open(viewUrl, '_blank');
            win.focus();
        } else {
            OPMRouter.navigate(this.process, this.process.rootProcessStep, true, { edition: 0, revision: 0 });
        }
    }

    private refreshContextMenu() {
        this.disableButtonUpdateAction = !this.isAuthor ||
            this.process.processWorkingStatus == ProcessWorkingStatus.SyncingToSharePoint ||
            this.process.processWorkingStatus == ProcessWorkingStatus.Archiving;
    }

    private renderUnpublishDialog(h) {
        return (
            <UnpublishDialog closeCallback={() => { this.openUnpublishDialog = false; }} process={this.process}></UnpublishDialog>
        )
    }

    private renderProcessHistoryDialog(h) {
        return (
            <opm-process-history-dialog
                closeCallback={() => { this.openProcessHistoryDialog = false; }}
                opmProcessId={this.process.opmProcessId}>
            </opm-process-history-dialog>
        )
    }

    render(h) {
        return (
            <div>
                <v-menu close-delay="50"
                    {
                    ...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <v-button {...toSpread} icon class={this.listViewClasses.menuHeader} v-show={this.process.isMouseOver} onClick={() => {
                                    this.refreshContextMenu();
                                }}><v-icon>more_vert</v-icon></v-button>
                            ]
                        }
                    })}>
                    <v-list>
                        <v-list-item onClick={() => { this.createDraft() }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.CreateDraft}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.viewProcess() }}>
                            <v-list-item-title>{this.loc.ProcessActions.ViewProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { }}>
                            <v-list-item-title>{this.loc.ProcessActions.ExportProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { this.openProcessHistoryDialog = true; }}>
                            <v-list-item-title>{this.loc.ProcessActions.ProcessHistory}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.MoveProcess}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.openUnpublishDialog = true; }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.UnpublishProcess}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                {this.openUnpublishDialog && this.renderUnpublishDialog(h)}
                {this.openProcessHistoryDialog && this.renderProcessHistoryDialog(h)}
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PublishedMenuActions);
});

