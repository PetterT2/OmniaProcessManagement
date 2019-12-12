import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Inject, Localize, Utils } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, OmniaUxLocalization, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, DialogModel } from '@omnia/fx/ux';
import { ProcessService } from '../../../../fx';
import { GuidValue } from '@omnia/fx-models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { ProcessLibraryStyles } from '../../../../models';

interface DeletedDialogProps {
    opmProcessId: GuidValue;
    closeCallback: (hasUpdate: boolean) => void;
}

@Component
export class DeletedDialog extends tsx.Component<DeletedDialogProps> {
    @Prop() opmProcessId: GuidValue;
    @Prop() closeCallback: (hasUpdate: boolean) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OmniaUxLocalizationNamespace) private omniaUxLoc: OmniaUxLocalization;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Inject(ProcessService) processService: ProcessService;

    private classes = StyleFlow.use(ProcessLibraryStyles);
    private dialogModel: DialogModel = { visible: false };
    isSaving: boolean = false;
    errMessage: string = "";

    created() {
        this.dialogModel.visible = true;
    }

    private close() {
        this.dialogModel.visible = false;
        this.closeCallback(false);
    }

    private onDelete() {
        this.isSaving = true;
        this.processService.deleteDraftProcess(this.opmProcessId).then(p => {
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
            <omfx-dialog
                dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={this.close}
                model={{ visible: true }}
                hideCloseButton
                width="500px"
                position={DialogPositions.Center}>
                <div>
                    <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                        <v-toolbar-title>{this.loc.ProcessActions.DeleteDraft}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={() => { this.close(); }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                        <div data-omfx>
                            <v-container>
                                <div v-show={Utils.isNullOrEmpty(this.errMessage)}>
                                    {this.loc.Messages.DeleteDraftProcessConfirmation}
                                </div>
                                <span class={[this.classes.error, 'mt-3 mb-3']}>{this.errMessage}</span>
                            </v-container>
                        </div>
                        <v-card-actions class={this.classes.dialogFooter}>
                            <v-spacer></v-spacer>
                            <v-btn
                                dark
                                color={this.omniaTheming.themes.primary.base}
                                onClick={this.onDelete} loading={this.isSaving}>{this.omniaUxLoc.Common.Buttons.Ok}</v-btn>
                            <v-btn onClick={this.close} text disabled={this.isSaving}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </omfx-dialog>
        );
    }
}