import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import {
    OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization,
    DialogPositions, DialogStyles, HeadingStyles, VueComponentBase
} from '@omnia/fx/ux';
import { Process, ProcessVersionType, VDialogScrollableDialogStyles } from '../../../../fx/models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMUtils, ProcessService } from '../../../../fx';
import { ProcessLibraryStyles } from '../../../../models';
import { InternalOPMTopics } from '../../../../fx/messaging/InternalOPMTopics';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import '../../../../core/styles/dialog/VDialogScrollableDialogStyles.css';
declare var moment;

interface PublishDialogProps {
    process: Process;
    closeCallback: () => void;
    isAuthor: boolean;
}


@Component
export class SyncToSharePointDialog extends VueComponentBase<PublishDialogProps>
{
    @Prop() process: Process;
    @Prop() closeCallback: () => void;
    @Prop() isAuthor: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessService) processService: ProcessService;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };
    errorMessage: string = '';
    isRetrying: boolean = false;
    dialogVisible: boolean = true;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);

    created() {

    }

    mounted() {
    }

    close() {
        if (this.closeCallback) this.closeCallback();
    }

    retrySync() {
        this.isRetrying = true;
        this.processService.syncToSharePoint(this.process.opmProcessId).then(() => {
            InternalOPMTopics.onProcessWorkingStatusChanged.publish(ProcessVersionType.Published);
            this.isRetrying = false;
            this.close();

        }).catch(msg => {
            this.errorMessage = msg;
            this.isRetrying = false;
        })
    }

    renderBody(h) {
        return (
            <v-container class={this.processLibraryClasses.centerDialogBody}>
                {this.corLoc.Messages.SyncToSharePointFailed}
            </v-container>
        )
    }

    renderFooter(h) {
        return (
            <v-card-actions>
                <v-spacer></v-spacer>
                {
                    this.isAuthor ?
                        <v-btn
                            dark
                            color={this.omniaTheming.themes.primary.base}
                            loading={this.isRetrying}
                            onClick={() => { this.retrySync() }}>{this.corLoc.ProcessActions.RetrySyncToSharePoint}
                        </v-btn>
                        : null
                }

                <v-btn
                    disabled={this.isRetrying}
                    light={!this.omniaTheming.promoted.body.dark}
                    text
                    onClick={this.close}>{this.omniaUxLoc.Common.Buttons.Cancel}
                </v-btn>
            </v-card-actions>
        )
    }

    render(h) {
        return (
            <v-dialog
                v-model={this.dialogVisible}
                width="800px"
                scrollable
                persistent
                dark={this.theming.body.bg.dark}>
                <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                    <v-card-title
                        class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                        dark={this.theming.chrome.bg.dark}>
                        <div>{this.corLoc.ProcessActions.SyncToSharePoint + " " + this.process.rootProcessStep.multilingualTitle}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={this.close}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        {this.renderBody(h)}
                    </v-card-text>
                    {this.renderFooter(h)}
                    {this.errorMessage && <div class={[this.processLibraryClasses.error, "mr-3", "pb-3"]}><span>{this.errorMessage}</span></div>}
                </v-card>
            </v-dialog>
        )
    }
}