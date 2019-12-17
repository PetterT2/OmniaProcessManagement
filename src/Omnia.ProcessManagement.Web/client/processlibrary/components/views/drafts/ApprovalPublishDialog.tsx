import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import {
    OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization,
    DialogPositions, DialogModel, DialogStyles, HeadingStyles, VueComponentBase
} from '@omnia/fx/ux';
import { UserService } from '@omnia/fx/services';
import { SharePointContext } from '@omnia/fx-sp';
import { Process, Workflow, WorkflowTask, Enums, ProcessVersionType } from '../../../../fx/models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { DefaultDateFormat } from '../../../Constants';
import { OPMUtils } from '../../../../fx';
import { PublishProcessService } from '../../../services';
import { LibraryStore } from '../../../stores';
import { ProcessLibraryStyles } from '../../../../models';
declare var moment;

interface PublishDialogProps {
    process: Process;
    closeCallback: () => void;
}

interface DisplayWorkflow extends Workflow {
    dueDateText: string,
    displayWorkflowTasks: Array<DisplayWorkflowTask>
}

interface DisplayWorkflowTask extends WorkflowTask {
    email: string,
    displayName: string
}

@Component
export class ApprovalPublishDialog extends VueComponentBase<PublishDialogProps>
{
    @Prop() process: Process;
    @Prop() closeCallback: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(UserService) private omniaUserService: UserService;
    @Inject(PublishProcessService) private publishProcessService: PublishProcessService;
    @Inject(OmniaContext) omniaCtx: OmniaContext;
    @Inject(LibraryStore) libraryStore: LibraryStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    private dialogModel: DialogModel = { visible: false };
    private headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };
    private dateFormat = DefaultDateFormat;
    private headers = [
        { text: this.coreLoc.Columns.Name, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Email, align: 'left', sortable: false }
    ];

    isLoading: boolean = false;
    hasError: boolean = false;
    isCancelling: boolean = false;
    errorMessage: string = "";
    formatter = {
        timeformat: '24hr',
        locale: 'en-us',
        firstdayofweek: 1
    };
    currentApproval: DisplayWorkflow;

    created() {
        this.dialogModel.visible = true;
        this.loadApproval();
    }

    mounted() {
    }

    private loadApproval() {
        this.isLoading = true;
        this.publishProcessService.getWorkflow(this.process.opmProcessId, this.spContext.pageContext.web.absoluteUrl)
            .then((data: Workflow) => {
                this.currentApproval = Object.assign({}, data) as DisplayWorkflow;
                this.currentApproval.displayWorkflowTasks = this.currentApproval.workflowTasks.map(item =>
                    Object.assign({}, item) as DisplayWorkflowTask);
                this.currentApproval.dueDateText = moment(this.currentApproval.dueDate).format(this.dateFormat);
                this.omniaUserService.resolveUsersByPrincipalNames(this.currentApproval.workflowTasks.map(r => OPMUtils.getUserPrincipleName(r.assignedUser)))
                    .then((value) => {
                        this.currentApproval.displayWorkflowTasks.forEach((d) => {
                            let user = value.find(us => us.userPrincipalName == OPMUtils.getUserPrincipleName(d.assignedUser));
                            if (user != null) {
                                d.displayName = user.displayName;
                                d.email = user.mail;
                            }
                        });
                        this.isLoading = false;
                    })
                    .catch((errorMessage: string) => {
                        this.isLoading = false;
                        this.hasError = true;
                        this.errorMessage = errorMessage;
                    });
            }).catch((errorMessage: string) => {
                this.isLoading = false;
                this.hasError = true;
                this.errorMessage = errorMessage;
            })
    }

    private isCancelApprovalAuthor(): boolean {
        return this.currentApproval && this.currentApproval.canCancelByUser;
    }

    private close() {
        this.dialogModel.visible = false;
        if (this.closeCallback) this.closeCallback();
    }

    private cancelApproval() {
        this.isCancelling = true;
        this.publishProcessService.cancelWorkflow(this.process.opmProcessId).then(() => {
            this.libraryStore.mutations.forceReloadProcessStatus.commit(ProcessVersionType.Draft);
            this.publishProcessService.processingCancelWorkflow(this.process.opmProcessId, this.currentApproval.id)
                .then(() => {
                    this.libraryStore.mutations.forceReloadProcessStatus.commit(ProcessVersionType.Draft);
                })
                .catch(() => {
                    this.libraryStore.mutations.forceReloadProcessStatus.commit(ProcessVersionType.Draft);
                })
            this.isCancelling = false;
            this.closeCallback();
        }).catch(msg => {
            this.isCancelling = false;
            this.hasError = true;
            this.errorMessage = msg;
        });
    }

    renderApprover(h, item: DisplayWorkflowTask) {
        return (
            <tr>
                {
                    this.headers.map(header => {
                        switch (header.text) {
                            case this.coreLoc.Columns.Name:
                                return (
                                    <td>
                                        {item.displayName}
                                    </td>
                                );
                            case this.coreLoc.Columns.Email:
                                return (
                                    <td>
                                        {item.email}
                                    </td>
                                );
                            default:
                                return (
                                    <td>
                                    </td>
                                )
                        }
                    })
                }
            </tr>
        )
    }

    renderBody(h) {
        return (
            <v-container class={this.processLibraryClasses.centerDialogBody}>
                <div>
                    <v-text-field
                        type="text"
                        dark={this.omniaTheming.promoted.body.dark}
                        color={this.omniaTheming.promoted.body.text.base}
                        value={this.loc.ProcessStatuses[Enums.WorkflowEnums.ProcessWorkingStatus[this.process.processWorkingStatus]]}
                        readonly label={this.coreLoc.Columns.Status}></v-text-field>
                </div>
                <div>
                    <v-text-field
                        type="text"
                        dark={this.omniaTheming.promoted.body.dark}
                        color={this.omniaTheming.promoted.body.text.base}
                        value={this.currentApproval.dueDateText}
                        readonly label={this.coreLoc.Columns.DueDate}></v-text-field>
                </div>
                <div>
                    <div class="v-text-field__slot">
                        <label class="v-label v-label--active">{this.coreLoc.Columns.Approver}</label>
                    </div>
                    <v-data-table headers={this.headers}
                        items-per-page={this.currentApproval.displayWorkflowTasks.length}
                        items={this.currentApproval.displayWorkflowTasks}
                        hide-default-footer
                        scopedSlots={{
                            item: p => this.renderApprover(h, p.item)
                        }}>
                        <div slot="no-data">
                            {this.loc.Messages.MessageNoItem}
                        </div>
                    </v-data-table>
                </div>
            </v-container>
        )
    }

    renderFooter(h) {
        return (
            <v-card-actions class={this.processLibraryClasses.dialogFooter}>
                <v-spacer></v-spacer>
                {
                    this.isCancelApprovalAuthor() ?
                        <v-btn
                            dark
                            color={this.omniaTheming.themes.primary.base}
                            loading={this.isCancelling}
                            onClick={() => { this.cancelApproval() }}>{this.loc.Approval.CancelApproval}
                        </v-btn>
                        : null
                }

                <v-btn
                    disabled={this.isCancelling}
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
                    model={this.dialogModel}
                    contentClass={this.omniaTheming.promoted.body.class}
                    width={'800px'}
                    position={DialogPositions.Center}>
                    <div>
                        <div class={this.omniaTheming.promoted.header.class}>
                            <omfx-heading styles={this.headingStyle} size={0}><span>{this.loc.ProcessActions.Publish + " " + this.process.rootProcessStep.multilingualTitle}</span></omfx-heading>
                        </div>
                        <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                            <div data-omfx>
                                {
                                    this.isLoading ?
                                        <v-skeleton-loader loading={true} height="100%" type="card"></v-skeleton-loader>
                                        :
                                        this.renderBody(h)
                                }
                            </div>
                            {this.renderFooter(h)}
                            {this.hasError && <div class={[this.processLibraryClasses.error, "mr-3", "pb-3"]}><span>{this.errorMessage}</span></div>}
                        </v-card>
                    </div>
                </omfx-dialog>
            </div>
        )
    }
}