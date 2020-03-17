import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Inject, Localize, Utils, IWebComponentInstance } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, OmniaUxLocalization, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, DialogModel, VueComponentBase } from '@omnia/fx/ux';
import { ProcessStore } from '../../../../fx';
import { GuidValue } from '@omnia/fx-models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { Process, VDialogScrollableDialogStyles } from '../../../../fx/models';
import '../../../../core/styles/dialog/VDialogScrollableDialogStyles.css';

interface DeletedDialogProps {
    process: Process;
    closeCallback: (hasUpdate: boolean) => void;
}

@Component
export class DeletedDialog extends VueComponentBase<DeletedDialogProps>{
    @Prop() process: Process;
    @Prop() closeCallback: (hasUpdate: boolean) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OmniaUxLocalizationNamespace) private omniaUxLoc: OmniaUxLocalization;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    @Inject(ProcessStore) processStore: ProcessStore;

    private classes = StyleFlow.use(ProcessLibraryStyles);
    private dialogModel: DialogModel = { visible: false };
    isSaving: boolean = false;
    errMessage: string = "";
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);
    dialogVisible: boolean = true;

    created() {
        this.dialogModel.visible = true;
    }

    private close() {
        this.dialogModel.visible = false;
        this.closeCallback(false);
    }

    private onDelete() {
        this.isSaving = true;
        this.processStore.actions.deleteDraftProcess.dispatch(this.process).then(p => {
            this.isSaving = false;
            this.dialogModel.visible = false;
            this.closeCallback(true);
        }).catch((err) => {
            this.isSaving = false;
            this.errMessage = err;
        });
    }

    public render(h) {
        return (
            <v-dialog
                v-model={this.dialogVisible}
                width="500px"
                scrollable
                persistent
                dark={this.theming.body.bg.dark}>
                <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                    <v-card-title
                        class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                        dark={this.theming.chrome.bg.dark}>
                        <div>{this.coreLoc.ProcessActions.DeleteDraft}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={this.close}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        <div v-show={Utils.isNullOrEmpty(this.errMessage)}>
                            {this.coreLoc.Messages.DeleteDraftProcessConfirmation}
                        </div>
                        <span class={[this.classes.error, 'mt-3 mb-3']}>{this.errMessage}</span>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            dark
                            color={this.omniaTheming.themes.primary.base}
                            onClick={this.onDelete} loading={this.isSaving}>{this.omniaUxLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn onClick={this.close} text disabled={this.isSaving}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        );
    }
}