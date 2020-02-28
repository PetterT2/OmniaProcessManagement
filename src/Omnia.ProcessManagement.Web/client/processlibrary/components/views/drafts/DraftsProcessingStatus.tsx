import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { Enums, Process, ProcessWorkingStatus, ProcessVersionType } from '../../../../fx/models';
import { ApprovalPublishDialog } from './ApprovalPublishDialog';
import { ProcessLibraryListViewTabs } from '../../../Constants';

interface DraftsProcessingStatusProps {
    closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    process: Process;
    redLabel: boolean;
    isAuthor: boolean;
}

@Component
export class DraftsProcessingStatus extends VueComponentBase<DraftsProcessingStatusProps> implements IWebComponentInstance {
    @Prop() closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    @Prop() process: Process;
    @Prop() redLabel: boolean;
    @Prop() isAuthor: boolean;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    selectedProcess: Process;
    openApprovalPublishDialog: boolean = false;

    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    renderApprovalPublishDialog(h) {
        return (
            <ApprovalPublishDialog
                closeCallback={() => { this.openApprovalPublishDialog = false; }}
                process={this.selectedProcess} >
            </ApprovalPublishDialog>
        )
    }

    renderStatus(h) {
        let statusName = this.loc.ProcessStatuses[ProcessWorkingStatus[this.process.processWorkingStatus]] || '';
        let checkedOutByName = "";
        if (this.process.processWorkingStatus == ProcessWorkingStatus.None && !Utils.isNullOrEmpty(this.process.checkedOutByName))
            checkedOutByName = this.process.checkedOutByName;
        let className = this.redLabel ? "red--text" : "";
        switch (this.process.processWorkingStatus) {
            case ProcessWorkingStatus.SentForApproval:
            case ProcessWorkingStatus.CancellingApprovalFailed:
                return <a class={className} onClick={() => {
                    this.selectedProcess = this.process;
                    this.openApprovalPublishDialog = true;
                }}>{statusName}</a>;
            default:
                return <div class={className}>
                    {statusName}{!Utils.isNullOrEmpty(checkedOutByName) ? this.loc.ProcessStatuses.CheckedOutBy + " " + checkedOutByName : ""}
                </div>;
        }
    }

    render(h) {
        return (
            <div>
                {this.renderStatus(h)}
                {this.openApprovalPublishDialog && this.renderApprovalPublishDialog(h)}
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DraftsProcessingStatus);
});

