import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles, ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { CurrentProcessStore } from '../../../../fx/stores';
import { RouteOptions, Process } from '../../../../fx/models';
import { ProcessDesignerItemFactory } from '../../../../processdesigner/designeritems';
import { ProcessDesignerUtils } from '../../../../processdesigner/Utils';
import { ProcessDesignerStore } from '../../../../processdesigner/stores';
import { DisplayModes } from '../../../../models/processdesigner';
import { OPMRouter } from '../../../../fx/routing';
import { PublishDialog } from './PublishDialog';
import { DeletedDialog } from './DeleteDialog';

interface DraftsMenuActionsProps {
    closeCallback: (isUpdate: boolean) => void;
    process: DisplayProcess;
}

@Component
export class DraftsMenuActions extends VueComponentBase<DraftsMenuActionsProps> implements IWebComponentInstance {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: (isUpdate: boolean) => void;
    @Prop() process: DisplayProcess;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    isLoadingContextMenu: boolean = false;
    disableButtonEdit: boolean = false;
    disableButtonPreview: boolean = false;
    disableButtonSendForComments: boolean = false;
    disableButtonPublish: boolean = false;
    disableButtonWorkflowHistory: boolean = false;
    disableButtonDelete: boolean = false;
    openDeleteDialog: boolean = false;
    openPublishDialog: boolean = false
    selectedProcess: Process;

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    private editProcess(process: DisplayProcess) {
        OPMRouter.navigate(process, process.rootProcessStep, RouteOptions.normal)
            .then(() => {
                this.currentProcessStore.actions.checkOut.dispatch().then(() => {
                    ProcessDesignerUtils.openProcessDesigner();
                    this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
                })
            })
    }

    private openDeleteDraft(item: Process) {
        this.selectedProcess = item;
        this.openDeleteDialog = true;
    }

    renderPublishDialog(h) {
        return (
            <PublishDialog
                closeCallback={() => { this.openPublishDialog = false; }}
                process={this.selectedProcess} >
            </PublishDialog>
        )
    }

    renderDeleteDialog(h) {
        return (
            <DeletedDialog
                closeCallback={(hasUpdate: boolean) => {
                    this.openDeleteDialog = false;
                    this.closeCallback(hasUpdate);
                }}
                opmProcessId={this.selectedProcess.opmProcessId}>
            </DeletedDialog>
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

                                }}><v-icon>more_vert</v-icon></v-button>
                            ]
                        }
                    })}>
                    <v-list>
                        <v-list-item onClick={() => { this.editProcess(this.process); }} disabled={this.isLoadingContextMenu || this.disableButtonEdit}>
                            <v-list-item-title>{this.loc.ProcessActions.Edit}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonPreview}>
                            <v-list-item-title>{this.loc.ProcessActions.Preview}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonSendForComments}>
                            <v-list-item-title>{this.loc.ProcessActions.SendForComments}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => {
                            this.selectedProcess = this.process;
                            this.openPublishDialog = true;
                        }} disabled={this.isLoadingContextMenu || this.disableButtonPublish}>
                            <v-list-item-title>{this.loc.ProcessActions.Publish}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonWorkflowHistory}>
                            <v-list-item-title>{this.loc.ProcessActions.WorkflowHistory}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.openDeleteDraft(this.process); }} disabled={this.isLoadingContextMenu || this.disableButtonDelete}>
                            <v-list-item-title>{this.loc.ProcessActions.DeleteDraft}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                {this.openDeleteDialog && this.renderDeleteDialog(h)}
                {this.openPublishDialog && this.renderPublishDialog(h)}
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DraftsMenuActions);
});

