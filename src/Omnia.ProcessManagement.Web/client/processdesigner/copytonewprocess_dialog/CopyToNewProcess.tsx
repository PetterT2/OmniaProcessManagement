import Component from 'vue-class-component';
import { Inject, Localize } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalization, StyleFlow, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessStore, CurrentProcessStore } from '../../fx';
import { GuidValue } from '@omnia/fx-models';
import { InternalOPMTopics } from '../../fx/messaging/InternalOPMTopics';
import { ProcessVersionType } from '../../fx/models';

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
            <omfx-dialog
                domProps-lazy={false}
                model={{ visible: this.processDesignerStore.panels.copyToNewProcessTypePanel.state.show }}
                onClose={this.onCloseDialog}
                width="600px"
                persistent
                hideCloseButton={true}
                position={DialogPositions.Center}>
                <v-toolbar color={this.omniaTheming.promoted.header.primary.base} flat
                    dark={this.omniaTheming.promoted.header.dark} tabs>
                    <v-toolbar-title>
                        {this.pdLoc.CopyNewProcess}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={this.onCloseDialog}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-row align="center" no-gutters>
                    <v-col cols="12" class={'pa-4'}>
                        <div>{this.pdLoc.CopyNewProcessConfirmation}</div>
                        <div>{this.pdLoc.CopyNewProcessConfirmationDescription}</div>
                    </v-col>
                    <v-col cols="12" class='text-right py-1 px-1'>
                        <v-btn onClick={this.onCopy} text loading={this.isSaving}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn onClick={this.onCloseDialog} text disabled={this.isSaving}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
                    </v-col>
                </v-row>
            </omfx-dialog>
        );
    }
}