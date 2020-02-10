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
import { WorkflowTask, Enums, ProcessWorkingStatus, WorkflowCompletedType, TaskOutcome, RouteOptions } from '../../../../fx/models';
import { UrlParameters } from '../../../Constants';
import { UserService } from '@omnia/fx/services';
import { OPMContext } from '../../../../fx/contexts';
import { OPMUtils, OPMRouter, ProcessStore } from '../../../../fx';
import { ProcessDesignerStore } from '../../../../processdesigner/stores';
import { ProcessDesignerUtils } from '../../../../processdesigner/Utils';
import { ProcessDesignerItemFactory } from '../../../../processdesigner/designeritems';
import { DisplayModes } from '../../../../models/processdesigner';

interface ApprovalTaskProps {
    closeCallback: () => void;
    previewPageUrl: string;
}

@Component
export class ApprovalTask extends VueComponentBase<ApprovalTaskProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: () => void;
    @Prop() previewPageUrl: string;

    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(PublishProcessService) publishProcessService: PublishProcessService;
    @Inject(TaskService) taskService: TaskService;
    @Inject(OmniaContext) omniaCtx: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(UserService) private omniaUserService: UserService;
    @Inject(OPMContext) private opmContext: OPMContext;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;


    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    private task: WorkflowTask = null;
    private taskId: string = "";
    private completedTaskDescription: string;
    private dateFormat: string = "YYYY-MM-DD";
    private errorMessage: string = "";

    private isLoadingTask: boolean = false;
    private isApproving: boolean = false;
    private isRejecting: boolean = false;
    private hasError: boolean = false;
    private emptyCommentError: boolean = false;

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
        this.taskService.getApprovalTaskById(parseInt(this.taskId), this.opmContext.teamAppId)
            .then((data) => {
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
                this.completedTaskDescription = this.completedTaskDescription.replace("{{User}}", this.task.assignedUserDisplayName);
            }
            else {
                this.completedTaskDescription = this.loc.Messages.MessageApprovalTaskEditingCompletedTaskNoComment;
                this.completedTaskDescription = this.completedTaskDescription.replace("{{User}}", this.task.assignedUserDisplayName);
            }
        }
    }

    private close() {
        if (this.closeCallback) this.closeCallback();
    }

    private approve() {
        this.isApproving = true;
        this.task.taskOutCome = TaskOutcome.Approved;
        this.completeApprovalTask();
    }

    private reject() {
        if (!this.task.comment || this.task.comment.length == 0) {
            this.hasError = true;
            this.errorMessage = this.loc.Messages.MessageRequireRejectComment;
            return false;
        }

        this.isRejecting = true;
        this.task.taskOutCome = TaskOutcome.Rejected;
        this.completeApprovalTask();
    }

    private completeApprovalTask() {
        this.publishProcessService.completeApprovalTask(this.task)
            .then(() => {
                this.hasError = false;
                this.isApproving = false;
                this.isRejecting = false;
                this.task.isCompleted = true;
                this.setTaskDescription();
            })
            .catch((errorMessage: string) => {
                this.hasError = true;
                this.errorMessage = errorMessage;
                this.isApproving = false;
            });
    }

    private checkTaskIsInApprovalStatus(): boolean {
        return this.task && this.task.sharePointTask.isCurrentResponsible && !this.task.isCompleted;
    }


    private allowToApproval() {
        return this.task && !this.task.isCompleted && this.task.sharePointTask.isCurrentResponsible && this.task.workflow.completedType == WorkflowCompletedType.None;
    }

    private previewProcess(e: MouseEvent) {
        e.preventDefault();
        let loadPreviewProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(this.task.rootProcessStepId);

        loadPreviewProcessPromise.then((processWithCheckoutInfo) => {
            this.processDesignerStore.actions.setProcessToShow.dispatch(processWithCheckoutInfo.process, processWithCheckoutInfo.process.rootProcessStep).then(() => {
                ProcessDesignerUtils.openProcessDesigner();
                this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentPreview);
            })
        })
    }

    renderBody(h) {
        if (this.task.workflow.completedType == WorkflowCompletedType.Cancelled) {
            return (
                <div>
                    <p>{this.loc.Messages.MessageTaskCancelledBySystem}</p>
                </div>
            )
        }
        if (this.task.isCompleted) {
            return (
                <div>
                    <p domProps-innerHTML={this.completedTaskDescription}></p>
                    <p v-show={this.task.comment && this.task.comment.length > 0}>{"\"" + this.task.comment + "\""}</p>
                </div>
            )
        }
        return (
            <div>
                {
                    !this.task.sharePointTask.isCurrentResponsible ?
                        this.renderTaskInfoForm(h) :
                        <div>

                            <div>
                                <div><p><a href="javascript:void(0)" onClick={this.previewProcess}>{this.task.sharePointTask.title}</a></p></div>

                                <p>{this.loc.Messages.MessageApprovalTaskEditingDescription}</p>
                                <p>{this.task.createdByUserDisplayName + " " + moment(this.task.createdAt).locale(this.omniaCtx.language).format(this.dateFormat) + ":"}</p>
                                {
                                    Utils.isNullOrEmpty(this.task.workflow.comment) ? null : <p>{"\"" + this.task.workflow.comment + "\""}</p>
                                }

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
                <div><p>{this.task.sharePointTask.title}</p></div>
                <p>
                    <b>{this.coreLoc.Columns.AssignedTo + ": "}</b>{this.task.assignedUserDisplayName}
                </p>
                <p>
                    <b>{this.coreLoc.Columns.CreatedBy + ": "}</b>{this.task.createdByUserDisplayName}
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
                                    class="mr-2"
                                    dark={!this.isRejecting}
                                    color={this.omniaTheming.themes.primary.base}
                                    disabled={this.isRejecting}
                                    loading={this.isApproving}
                                    v-show={this.allowToApproval}
                                    onClick={this.approve}>{this.omniaUxLoc.Common.Buttons.Approve}</v-btn>,
                                <v-btn
                                    class="mr-2"
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