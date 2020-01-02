import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import {
    OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization,
    DialogPositions, DialogStyles, HeadingStyles, VueComponentBase
} from '@omnia/fx/ux';
import { Process, ProcessVersionType } from '../../../../fx/models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMUtils, ProcessService } from '../../../../fx';
import { ProcessLibraryStyles } from '../../../../models';
import { InternalOPMTopics } from '../../../../fx/messaging/InternalOPMTopics';
declare var moment;

interface PublishDialogProps {
    process: Process;
    closeCallback: () => void;
    isAuthor: boolean;
}

@Component
export class ArchiveToSharePointDialog extends VueComponentBase<PublishDialogProps>
{
    @Prop() process: Process;
    @Prop() closeCallback: () => void;
    @Prop() isAuthor: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessService) processService: ProcessService;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };
    errorMessage: string = '';
    isRetrying: boolean = false;
    created() {

    }

    mounted() {
    }

    close() {
        if (this.closeCallback) this.closeCallback();
    }

    retryArchive() {
        this.isRetrying = true;
        this.processService.triggerArchive(this.process.opmProcessId).then(() => {
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
                {this.loc.Messages.ArchiveProcessFailed}
            </v-container>
        )
    }

    renderFooter(h) {
        return (
            <v-card-actions class={this.processLibraryClasses.dialogFooter}>
                <v-spacer></v-spacer>
                {
                    this.isAuthor ?
                        <v-btn
                            dark
                            color={this.omniaTheming.themes.primary.base}
                            loading={this.isRetrying}
                            onClick={() => { this.retryArchive() }}>{this.loc.ProcessActions.RetrySyncToSharePoint}
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
            <div>
                <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                    onClose={this.close}
                    model={{ visible: true }}
                    contentClass={this.omniaTheming.promoted.body.class}
                    width={'800px'}
                    position={DialogPositions.Center}>
                    <div>
                        <div class={this.omniaTheming.promoted.header.class}>
                            <omfx-heading styles={this.headingStyle} size={0}><span>{this.loc.ProcessActions.Archive + " " + this.process.rootProcessStep.multilingualTitle}</span></omfx-heading>
                        </div>
                        <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                            <div data-omfx>
                                {
                                    this.renderBody(h)
                                }
                            </div>
                            {this.renderFooter(h)}
                            {this.errorMessage && <div class={[this.processLibraryClasses.error, "mr-3", "pb-3"]}><span>{this.errorMessage}</span></div>}
                        </v-card>
                    </div>
                </omfx-dialog>
            </div>
        )
    }
}