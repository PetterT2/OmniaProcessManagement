﻿import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { Enums, Process, ProcessWorkingStatus } from '../../../../fx/models';
import { ApprovalPublishDialog } from './ApprovalPublishDialog';

interface DraftsProcessingStatusProps {
    closeCallback: (isUpdate: boolean) => void;
    process: Process;
    redLabel: boolean;
    isAuthor: boolean;
}

@Component
export class DraftsProcessingStatus extends VueComponentBase<DraftsProcessingStatusProps> implements IWebComponentInstance {
    @Prop() closeCallback: (isUpdate: boolean) => void;
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
        let statusName = this.loc.ProcessStatuses[ProcessWorkingStatus[this.process.processWorkingStatus]];
        let className = this.redLabel ? "red--text" : "";
        switch (this.process.processWorkingStatus) {
            case ProcessWorkingStatus.SentForApproval:
            case ProcessWorkingStatus.CancellingApprovalFailed:
                return <a class={className} onClick={() => {
                    this.selectedProcess = this.process;
                    this.openApprovalPublishDialog = true;
                }}>{statusName}</a>;
            default:
                return <div class={className}>{statusName}</div>;
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

