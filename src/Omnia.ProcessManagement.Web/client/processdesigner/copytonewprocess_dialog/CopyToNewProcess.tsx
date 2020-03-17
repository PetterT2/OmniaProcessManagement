﻿import Component from 'vue-class-component';
import { Inject, Localize } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalization, StyleFlow, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessStore, CurrentProcessStore } from '../../fx';
import { GuidValue } from '@omnia/fx-models';
import { InternalOPMTopics } from '../../fx/messaging/InternalOPMTopics';
import { ProcessVersionType, VDialogScrollableDialogStyles } from '../../fx/models';
import '../../core/styles/dialog/VDialogScrollableDialogStyles.css';

export interface CopyToNewProcessDialogProps {
   
}

@Component
export class CopyToNewProcessDialog extends VueComponentBase<CopyToNewProcessDialogProps> {

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessStore) processStore: ProcessStore;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    isSaving: boolean = false;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);

    created() {
    }

    onCloseDialog() {
        this.processDesignerStore.panels.copyToNewProcessTypePanel.mutate((state) => { state.state.show = false });
    }

    onCopy() {
        this.isSaving = true;
        var referenceData = this.currentProcessStore.getters.referenceData();
        this.processStore.actions.copyToNewProcess.dispatch(referenceData.process.opmProcessId, referenceData.current.processStep.id).then(() => {
            InternalOPMTopics.onProcessChanged.publish(ProcessVersionType.Draft);
            this.isSaving = false;
            this.onCloseDialog();
            this.processDesignerStore.item.state.onClose();
        }).catch((err) => {
            this.isSaving = false;
        })
    }

    public render(h) {
        return (
            <v-dialog
                v-model={this.processDesignerStore.panels.copyToNewProcessTypePanel.state.show}
                width="600px"
                scrollable
                persistent
                dark={this.theming.body.bg.dark}>
                <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                    <v-card-title
                        class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                        dark={this.theming.chrome.bg.dark}>
                        <div>{this.pdLoc.CopyNewProcess}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={this.onCloseDialog}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        <div>{this.pdLoc.CopyNewProcessConfirmation}</div>
                        <div>{this.pdLoc.CopyNewProcessConfirmationDescription}</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn onClick={this.onCopy} text loading={this.isSaving}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn onClick={this.onCloseDialog} text disabled={this.isSaving}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        );
    }
}