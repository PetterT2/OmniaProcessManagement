import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { Enums, Process, ProcessWorkingStatus } from '../../../../fx/models';
import { SyncToSharePointDialog } from './SyncToSharePointDialog';
import { ArchiveToSharePointDialog } from './ArchiveToSharePointDialog';

interface PublishedProcessingStatusProps {
    closeCallback: (isUpdate: boolean) => void;
    process: Process;
    redLabel: boolean;
    isAuthor: boolean;
}

@Component
export class PublishedProcessingStatus extends VueComponentBase<PublishedProcessingStatusProps> implements IWebComponentInstance {
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
    openArchiveToSharePointDialog: boolean = false;

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
            <SyncToSharePointDialog
                closeCallback={() => { this.openApprovalPublishDialog = false; }}
                process={this.selectedProcess}
                isAuthor={this.isAuthor}>
            </SyncToSharePointDialog>
        )
    }

    renderArchiveToSharePointDialog(h) {
        return (
            <ArchiveToSharePointDialog closeCallback={() => { this.openArchiveToSharePointDialog = false; }}
                process={this.selectedProcess}
                isAuthor={this.isAuthor}>
            </ArchiveToSharePointDialog>
        )
    }

    renderStatus(h) {
        let statusName = this.loc.ProcessStatuses[ProcessWorkingStatus[this.process.processWorkingStatus]];
        let className = this.redLabel ? "red--text" : "";
        switch (this.process.processWorkingStatus) {
            case ProcessWorkingStatus.SyncingToSharePointFailed:
                return <a class={className} onClick={() => {
                    this.selectedProcess = this.process;
                    this.openApprovalPublishDialog = true;
                }}>{statusName}</a>;
            case ProcessWorkingStatus.ArchivingFailed:
                return <a class={className} onClick={() => {
                    this.selectedProcess = this.process;
                    this.openArchiveToSharePointDialog = true;
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
                {this.openArchiveToSharePointDialog && this.renderArchiveToSharePointDialog(h)}
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PublishedProcessingStatus);
});

