import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, WebUtils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { TenantRegionalSettings } from '@omnia/fx-models';
import { StyleFlow, OmniaUxLocalization, OmniaUxLocalizationNamespace, VueComponentBase, ConfirmDialogResponse, OmniaTheming } from '@omnia/fx/ux';
import * as moment from 'moment';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessLibraryListViewStyles, ProcessLibraryStyles } from '../../../../models';
import { PublishProcessService, TaskService } from '../../../services';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { WorkflowTask, WorkflowApprovalTask, Enums } from '../../../../fx/models';
import { UrlParameters } from '../../../Constants';
import { UserService } from '@omnia/fx/services';

interface ApprovalTaskProps {
    closeCallback: () => void;
}

@Component
export class ApprovalTask extends VueComponentBase<ApprovalTaskProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: () => void;

    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(PublishProcessService) publishProcessService: PublishProcessService;
    @Inject(TaskService) taskService: TaskService;
    @Inject(OmniaContext) omniaCtx: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(UserService) private omniaUserService: UserService;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    private listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    private task: WorkflowApprovalTask = null;
    private taskId: string = "";
    private completedTaskDescription: string;
    private dateFormat: string = "YYYY-MM-DD";
    private resolveTaskErrorMessage: string = "";
    private errorMessage: string = "";

    private isLoadingTask: boolean = false;
    private isApproving: boolean = false;
    private isRejecting: boolean = false;
    private hasError: boolean = false;
    private emptyCommentError: boolean = false;
    private isDeleting: boolean = false;

    created() {
        this.init();
    }

    private init() {
        let regionalSettings = this.omniaCtx.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat && regionalSettings.timeFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.isLoadingTask = true;
        this.taskId = WebUtils.getQs(UrlParameters.TaskId);
        this.taskService.getById(parseInt(this.taskId), this.spContext.pageContext.web.absoluteUrl)
            .then((data: WorkflowApprovalTask) => {
                this.task = data;
                if (this.task != null) {
                    this.setTaskDescription();
                }
                this.isLoadingTask = false;
            })
            .catch((err) => {
                this.errorMessage = err;
                this.hasError = true;
            });
    }

    private setTaskDescription() {
        if (this.task.isCompleted) {
            if (this.task.comment && this.task.comment.length > 0) {
                this.completedTaskDescription = this.loc.Messages.MessageApprovalTaskEditingCompletedTask;
                this.completedTaskDescription = this.completedTaskDescription.replace("{{User}}", this.task.assignedTo.displayName);
            }
            else {
                this.completedTaskDescription = this.loc.Messages.MessageApprovalTaskEditingCompletedTaskNoComment;
                this.completedTaskDescription = this.completedTaskDescription.replace("{{User}}", this.task.assignedTo.displayName);
            }
        }
    }

    private close() {
        if (this.closeCallback) this.closeCallback();
    }

    private approve() {
        this.isApproving = true;
        this.task.taskOutCome = Enums.WorkflowEnums.TaskOutcome.Approved;
        this.completeApprovalTask();
    }

    private reject() {
        if (!this.task.comment || this.task.comment.length == 0) {
            this.hasError = true;
            this.errorMessage = this.loc.Messages.MessageRequireRejectComment;
            return false;
        }

        this.isRejecting = true;
        this.task.taskOutCome = Enums.WorkflowEnums.TaskOutcome.Rejected;
        this.completeApprovalTask();
    }

    private completeApprovalTask() {
        //this.approvalTaskService.completeApprovalTask(this.task)
        //    .then(() => {
        //        this.approvalTaskService.processCompletingApprovalTask(this.task).catch((errorMessage: string) => {
        //            this.hasError = true;
        //            this.errorMessage = errorMessage;
        //        });
        //        this.hasError = false;
        //        this.task.status = TaskStatusText.Completed;
        //        this.isApproving = false;
        //        this.isRejecting = false;
        //        this.setTaskDescription();
        //    })
        //    .catch((errorMessage: string) => {
        //        this.hasError = true;
        //        this.errorMessage = errorMessage;
        //        this.isApproving = false;
        //    });
    }

    private checkTaskIsInApprovalStatus(): boolean {
        return this.task && this.task.process && this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.WaitingForApproval;
    }

    private checkAllowToDeleteTask(): boolean {
        return (this.task && (this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedPublishing ||
            this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedSendingForApproval ||
            this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedCancellingApproval));
    }

    private checkValidToShowTaskContent(): boolean {
        if (!this.task.isCompleted && this.task.workflow.completedType != Enums.WorkflowEnums.WorkflowCompletedType.Cancelled) {
            if (this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedSendingForApproval ||
                this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedPublishing) {
                this.resolveTaskErrorMessage = this.loc.Messages.MessageProcessOfTaskFailedToSendForApproval;
                return false;
            }
            if (this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.FailedCancellingApproval) {
                this.resolveTaskErrorMessage = this.loc.Messages.MessageFailedToCancelTask;
                return false;
            }
            return true;
        }
        else {
            this.resolveTaskErrorMessage = this.loc.Messages.MessageTaskHasBeenCompletedOrCanceled;
            return false;
        }
    }

    private delete() {
        this.$confirm.open().then(res => {
            if (res == ConfirmDialogResponse.Ok) {
                //this.isDeleting = true;
                //this.taskService.deleteTask(this.spContext.pageContext.web.absoluteUrl, this.task.id).then(() => {
                //    this.isDeleting = false;
                //    this.close();
                //}).catch(msg => {
                //    this.isDeleting = false;
                //})
            }
        })
    }

    private allowToApproval() {
        return this.task && !this.task.isCompleted && this.task.responsible && this.task.workflow.completedType == Enums.WorkflowEnums.WorkflowCompletedType.None;
    }

    renderBody(h) {
        if (this.task && this.task.process && this.task.process.processWorkingStatus == Enums.WorkflowEnums.ProcessWorkingStatus.SendingForApproval) {
            return (
                <div class="mt-3 mb-3">
                    <span class={this.processLibraryClasses.error}>{this.loc.Messages.TaskIsInProcessingStatus}</span>
                </div>
            )
        }
        if (this.task.workflow.completedType == Enums.WorkflowEnums.WorkflowCompletedType.Cancelled) {
            return (
                <div>
                    <p>{this.loc.Messages.MessageTaskCancelledBySystem}</p>
                </div>
            )
        }
        if (this.task.isCompleted) {
            return (
                <div>
                    <p><span domProps-innerHTML={this.completedTaskDescription}></span></p>
                    <p v-show={this.task.comment && this.task.comment.length > 0}>{"\"" + this.task.comment + "\""}</p>
                </div>
            )
        }
        return (
            <div>
                {
                    !this.task.responsible ?
                        this.renderTaskInfoForm(h) :
                        <div>
                            {
                                this.checkValidToShowTaskContent() ?
                                    <div>
                                        <p><span domProps-innerHTML={this.loc.Messages.MessageApprovalTaskEditingDescription}></span></p>
                                        <p>{this.task.createdBy + " " + moment(this.task.createdAt).locale(this.omniaCtx.language).format(this.dateFormat) + ":"}</p>
                                        {Utils.isNullOrEmpty(this.task.workflow.comment) ? null : <p> {"\"" + this.task.workflow.comment + "\""}</p>}

                                        <v-textarea
                                            v-model={this.task.comment}
                                            label={this.coreLoc.Columns.Comment}
                                        ></v-textarea>
                                        {
                                            this.emptyCommentError ?
                                                <div><span class={this.processLibraryClasses.error}>{this.loc.Messages.MessageRequireRejectComment}</span></div>
                                                : null
                                        }
                                    </div>
                                    :
                                    <span class={this.processLibraryClasses.error}>{this.resolveTaskErrorMessage}</span>
                            }

                            {
                                this.hasError ?
                                    <div><span class={this.processLibraryClasses.error} > {this.errorMessage}</span></div>
                                    : null
                            }

                        </div>
                }
            </div>
        )
    }

    renderTaskInfoForm(h) {
        return (
            <div>
                <p>
                    <b>{this.coreLoc.Columns.AssignedTo + ": "}</b>{this.task.assignedTo.displayName}
                </p>
                <p>
                    <b>{this.coreLoc.Columns.CreatedBy + ": "}</b>{this.task.createdBy}
                </p>
                <p>
                    <b>{this.coreLoc.Columns.Status + ": "}</b>{this.loc.TaskStatus.NotStarted}
                </p>
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {
                    this.isLoadingTask ?
                        <v-skeleton-loader loading={true} height="100%" type="text"></v-skeleton-loader>
                        : this.renderBody(h)
                }

                <div class='text-right' v-show={!this.isLoadingTask}>
                    {
                        this.checkTaskIsInApprovalStatus() ?
                            [
                                <v-btn
                                    dark={!this.isRejecting}
                                    color={this.omniaTheming.themes.primary.base}
                                    disabled={this.isRejecting}
                                    loading={this.isApproving}
                                    v-show={this.allowToApproval}
                                    onClick={this.approve}>{this.omniaUxLoc.Common.Buttons.Approve}</v-btn>,
                                <v-btn
                                    dark={!this.isApproving}
                                    color={this.omniaTheming.themes.primary.base}
                                    disabled={this.isApproving}
                                    loading={this.isRejecting}
                                    v-show={this.allowToApproval}
                                    onClick={this.reject}>{this.omniaUxLoc.Common.Buttons.Reject}</v-btn>
                            ]
                            : null
                    }
                    {
                        this.checkAllowToDeleteTask() ?
                            <v-btn
                                loading={this.isDeleting}
                                onClick={this.delete} text>{this.omniaUxLoc.Common.Buttons.Delete}</v-btn>
                            : null
                    }
                    {
                        (this.allowToApproval && this.checkTaskIsInApprovalStatus()) ?
                            <v-btn onClick={this.close} text disabled={this.isApproving || this.isRejecting}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                            :
                            <v-btn onClick={this.close} text disabled={this.isApproving || this.isRejecting}>{this.omniaUxLoc.Common.Buttons.Close}</v-btn>
                    }
                </div>
            </div>
        )
    }
}