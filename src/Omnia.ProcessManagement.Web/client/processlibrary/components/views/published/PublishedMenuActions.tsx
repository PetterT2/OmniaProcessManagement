import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { Process, Enums, ProcessWorkingStatus, ProcessVersionType } from '../../../../fx/models';
import { ProcessStore, OPMUtils, OPMRouter, ProcessRendererOptions } from '../../../../fx';
import { ProcessLibraryListViewTabs } from '../../../Constants';
import { InternalOPMTopics } from '../../../../fx/messaging/InternalOPMTopics';

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
            var viewUrl = OPMUtils.createProcessNavigationUrl(this.process, this.process.rootProcessStep, this.viewPageUrl, false);
            var win = window.open(viewUrl, '_blank');
            win.focus();
        } else {
            OPMRouter.navigate(this.process, this.process.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
        }
    }

    private refreshContextMenu() {
        this.disableButtonUpdateAction = !this.isAuthor ||
            this.process.processWorkingStatus == ProcessWorkingStatus.SyncingToSharePoint ||
            this.process.processWorkingStatus == ProcessWorkingStatus.Archiving;
    }

    private renderUnpublishDialog(h) {
        return (
            <opm-unpublish-process-dialog
                closeCallback={(unpublished: boolean) => {
                    if (unpublished) {
                        InternalOPMTopics.onProcessWorkingStatusChanged.publish(ProcessVersionType.Published);
                    }
                    this.openUnpublishDialog = false;
                }}
                process={this.process}>
            </opm-unpublish-process-dialog>
        )
    }

    private renderProcessHistoryDialog(h) {
        return (
            <opm-process-history-dialog
                viewPageUrl={this.viewPageUrl}
                closeCallback={() => { this.openProcessHistoryDialog = false; }}
                opmProcessId={this.process.opmProcessId}>
            </opm-process-history-dialog>
        )
    }

    render(h) {
        let showNotImplementYetItem = false;
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
                    <v-list min-width={200}>
                        <v-list-item onClick={() => { this.createDraft() }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.corLoc.ProcessActions.CreateDraft}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.viewProcess() }}>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.corLoc.ProcessActions.ViewProcess}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        {
                            showNotImplementYetItem ?
                                <v-list-item onClick={() => { }}>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.corLoc.ProcessActions.ExportProcess}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                : null
                        }

                        <v-list-item onClick={() => { this.openProcessHistoryDialog = true; }}>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.corLoc.ProcessActions.ProcessHistory}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        {
                            showNotImplementYetItem ?
                                [<v-list-item onClick={() => { }} disabled={this.disableButtonUpdateAction}>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.corLoc.ProcessActions.MoveProcess}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>,
                                <v-divider></v-divider>]
                                : null
                        }

                        <v-list-item onClick={() => { this.openUnpublishDialog = true; }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.corLoc.ProcessActions.UnpublishProcess}</v-list-item-title>
                            </v-list-item-content>
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

