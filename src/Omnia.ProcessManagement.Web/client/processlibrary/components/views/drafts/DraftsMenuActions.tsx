import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles, ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { CurrentProcessStore, ProcessStore } from '../../../../fx/stores';
import { Process, Enums, ProcessWorkingStatus } from '../../../../fx/models';
import { ProcessDesignerItemFactory } from '../../../../processdesigner/designeritems';
import { ProcessDesignerUtils } from '../../../../processdesigner/Utils';
import { ProcessDesignerStore } from '../../../../processdesigner/stores';
import { DisplayModes } from '../../../../models/processdesigner';
import { PublishDialog } from './PublishDialog';
import { DeletedDialog } from './DeleteDialog';
import { ProcessLibraryListViewTabs } from '../../../Constants';

interface DraftsMenuActionsProps {
    closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    process: DisplayProcess;
    isAuthor: boolean;
    viewPageUrl: string;
}

@Component
export class DraftsMenuActions extends VueComponentBase<DraftsMenuActionsProps> implements IWebComponentInstance {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    @Prop() process: DisplayProcess;
    @Prop() isAuthor: boolean;
    @Prop() viewPageUrl: string;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessStore) processStore: ProcessStore;


    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    disableButtonUpdateAction: boolean = false;
    openDeleteDialog: boolean = false;
    openPublishDialog: boolean = false

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    private refreshContextMenu() {
        let editActionsDict: Array<ProcessWorkingStatus> = [
            ProcessWorkingStatus.None,
            ProcessWorkingStatus.SendingForApprovalFailed
        ];
        this.disableButtonUpdateAction = !(this.isAuthor && editActionsDict.findIndex(s => s == this.process.processWorkingStatus) > -1);
    }

    openProcessDesigner(process: Process, mode: DisplayModes) {
        this.processDesignerStore.actions.setProcessToShow.dispatch(process, process.rootProcessStep).then(() => {
            ProcessDesignerUtils.openProcessDesigner();
            this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), mode);
        })
    }

    private editProcess() {
        let loadPreviewProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(this.process.rootProcessStep.id);
        let checkoutProcess = this.processStore.actions.checkoutProcess.dispatch(this.process.opmProcessId);

        checkoutProcess.then(process => {
            this.openProcessDesigner(process, DisplayModes.contentEditing);
        }).catch(() => {
            loadPreviewProcessPromise.then(processWithCheckoutInfo => {
                //Does not have permission or checked out by other user
                if (!processWithCheckoutInfo.checkoutInfo || !processWithCheckoutInfo.checkoutInfo.canCheckout) {
                    this.openProcessDesigner(processWithCheckoutInfo.process, DisplayModes.contentPreview);
                }
            })
        })
    }

    private previewProcess() {
        let loadPreviewProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(this.process.rootProcessStep.id);

        loadPreviewProcessPromise.then((processWithCheckoutInfo) => {
            this.openProcessDesigner(processWithCheckoutInfo.process, DisplayModes.contentPreview);
        })
    }

    private openDeleteDraft() {
        this.openDeleteDialog = true;
    }

    renderPublishDialog(h) {
        return (
            <PublishDialog
                closeCallback={() => { this.openPublishDialog = false; }}
                process={this.process} >
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
                opmProcessId={this.process.opmProcessId}>
            </DeletedDialog>
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
                    <v-list>
                        <v-list-item onClick={() => { this.editProcess(); }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.corLoc.ProcessActions.Edit}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { this.previewProcess(); }}>
                            <v-list-item-title>{this.corLoc.ProcessActions.Preview}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        {
                            showNotImplementYetItem ?
                                <v-list-item onClick={() => { }} disabled={this.disableButtonUpdateAction}>
                                    <v-list-item-title>{this.corLoc.ProcessActions.SendForComments}</v-list-item-title>
                                </v-list-item>
                                : null
                        }
                        <v-list-item onClick={() => {
                            this.openPublishDialog = true;
                        }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.corLoc.ProcessActions.Publish}</v-list-item-title>
                        </v-list-item>
                        {
                            showNotImplementYetItem ?
                                [<v-divider></v-divider>,
                                <v-list-item onClick={() => { }}>
                                    <v-list-item-title>{this.corLoc.ProcessActions.WorkflowHistory}</v-list-item-title>
                                </v-list-item>]
                                : null
                        }
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.openDeleteDraft(); }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.corLoc.ProcessActions.DeleteDraft}</v-list-item-title>
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

