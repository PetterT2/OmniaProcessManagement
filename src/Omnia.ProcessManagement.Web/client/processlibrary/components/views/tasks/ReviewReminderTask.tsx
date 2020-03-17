import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, WebUtils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { TenantRegionalSettings } from '@omnia/fx-models';
import { StyleFlow, OmniaUxLocalization, OmniaUxLocalizationNamespace, VueComponentBase, ConfirmDialogResponse, OmniaTheming, DialogPositions } from '@omnia/fx/ux';
import { ProcessLibraryListViewStyles, ProcessLibraryStyles } from '../../../../models';
import { PublishProcessService, ReviewReminderService } from '../../../services';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { WorkflowTask, Enums, ProcessWorkingStatus, WorkflowCompletedType, TaskOutcome, ReviewReminderTask, VDialogScrollableDialogStyles } from '../../../../fx/models';
import { UrlParameters } from '../../../Constants';
import { OPMContext } from '../../../../fx/contexts';
import { ProcessDesignerStore } from '../../../../processdesigner/stores';
import { ProcessStore, OPMUtils, OPMRouter, ProcessRendererOptions } from '../../../../fx';
import '../../../../core/styles/dialog/VDialogScrollableDialogStyles.css';

interface ReviewReminderTaskComponentProps {
    closeCallback: () => void;
    previewPageUrl: string;
}

@Component
export class ReviewReminderTaskComponent extends VueComponentBase<ReviewReminderTaskComponentProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: () => void;
    @Prop() previewPageUrl: string;

    @Inject(ReviewReminderService) reviewReminderService: ReviewReminderService;
    @Inject(OmniaContext) omniaCtx: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(OPMContext) private opmContext: OPMContext;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessStore) processStore: ProcessStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    formatter = {
        timeformat: 'ampm',
        locale: 'en-us',
        firstdayofweek: 1
    };
    dateFormat: string = "YYYY-MM-DD";
    isLoading: boolean = true;
    taskId: string = "";
    task: ReviewReminderTask = null;

    errorMessage: string = '';
    openSetNewReviewDateDialog: boolean = false;
    openUnpublishDialog: boolean = false;
    newReviewDate: string = '';
    processing: boolean = false;
    dialogVisible: boolean = true;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);

    created() {
        this.init();
    }

    init() {
        let regionalSettings = this.omniaCtx.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat && regionalSettings.timeFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.isLoading = true;
        this.taskId = WebUtils.getQs(UrlParameters.TaskId);
        this.reviewReminderService.getReviewReminderTask(parseInt(this.taskId), this.opmContext.teamAppId)
            .then((data) => {
                this.task = data;
                this.isLoading = false;
            })
            .catch((err) => {
                this.errorMessage = err;
            });
    }


    close() {
        if (this.closeCallback) this.closeCallback();
    }


    closeTask() {
        this.processing = true;
        this.reviewReminderService.closeTask(parseInt(this.taskId), this.opmContext.teamAppId)
            .then(() => {
                this.processing = false;
                this.task.sharePointTask.percentComplete = 1;
            })
            .catch((errorMessage: string) => {
                this.processing = false;
                this.errorMessage = errorMessage;
            });
    }

    setNewReviewDate() {
        this.openSetNewReviewDateDialog = false;
        this.processing = true;
        this.reviewReminderService.setNewReviewDate(parseInt(this.taskId), this.opmContext.teamAppId, this.newReviewDate)
            .then(() => {
                
                this.processing = false;
                this.task.sharePointTask.percentComplete = 1;
            })
            .catch((errorMessage: string) => {
                this.processing = false;
                this.errorMessage = errorMessage;
            });
    }

    createDraft() {
        this.$confirm.open({}).then(res => {
            if (res == ConfirmDialogResponse.Ok) {
                this.processing = true;
                this.reviewReminderService.createDraft(parseInt(this.taskId), this.opmContext.teamAppId).then(() => {
                    this.processing = false;
                    this.task.sharePointTask.percentComplete = 1;
                }).catch((errorMessage) => {
                    this.processing = false;
                    this.errorMessage = errorMessage;
                })
            }
        })
    }

    unpublish() {
        this.openUnpublishDialog = false;
        this.processing = true;
        this.reviewReminderService.unpublish(parseInt(this.taskId), this.opmContext.teamAppId).then(() => {
            this.processing = false;
            this.task.sharePointTask.percentComplete = 1;
        }).catch((errorMessage) => {
            this.processing = false;
            this.errorMessage = errorMessage;
        })
    }

    viewProcess(e: MouseEvent) {
        let process = this.task.publishedProcess;
        if (process) {
            if (this.previewPageUrl) {
                var viewUrl = OPMUtils.createProcessNavigationUrl(process, process.rootProcessStep, this.previewPageUrl, false);
                var win = window.open(viewUrl, '_blank');
                win.focus();
            } else {
                OPMRouter.navigate(process, process.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
            }
        }
    }

    renderActions(h, taskCompleted: boolean, allowCloseTask: boolean) {
        return [
            <v-layout class='mt-4'>
                <v-flex>
                    <v-btn text onClick={() => { this.closeCallback() }}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                </v-flex>

                {
                    !allowCloseTask && !taskCompleted &&
                    <v-flex class="text-right">
                        <v-btn loading={this.processing} class="mr-2" onClick={() => { this.openSetNewReviewDateDialog = true; }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.SetNewReviewDate}</v-btn>
                        <v-btn loading={this.processing} class="mr-2" onClick={() => { this.openUnpublishDialog = true; }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.Unpublish}</v-btn>
                        <v-btn loading={this.processing} onClick={() => { this.createDraft() }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.CreateDraft}</v-btn>
                    </v-flex>
                }
                {
                    allowCloseTask && !taskCompleted &&
                    <v-flex class="text-right">
                        <v-btn loading={this.processing} onClick={() => { this.closeTask() }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.CloseTask}</v-btn>
                    </v-flex>
                }
            </v-layout>,
            this.errorMessage && <div class="text-right mt-4">{this.errorMessage}</div>
        ]

    }

    renderActionDialogs(h) {
        return (
            <div style={{ display: 'none' }}>
                {
                    this.openSetNewReviewDateDialog && this.renderSetNewReviewDateDialog(h)
                }
                {
                    this.openUnpublishDialog && this.renderUnpublishDialog(h)
                }
            </div>
        )
    }

    renderSetNewReviewDateDialog(h) {
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
                        <div>{this.coreLoc.ProcessActions.SetNewReviewDate}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={() => { this.openSetNewReviewDateDialog = false }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        <omfx-date-time-picker
                            model={this.newReviewDate}
                            color={this.omniaTheming.themes.primary.base}
                            dark={this.omniaTheming.promoted.body.dark}
                            pickerMode={"date"}
                            formatter={this.formatter}
                            onModelChange={(newVal) => { this.newReviewDate = newVal; }}>
                        </omfx-date-time-picker>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            disabled={!this.newReviewDate}
                            class="mr-2"
                            dark={this.newReviewDate ? true : false}
                            color={this.omniaTheming.themes.primary.base}
                            onClick={() => { this.setNewReviewDate() }}>
                            {this.omniaUxLoc.Common.Buttons.Ok}
                        </v-btn>
                        <v-btn
                            dark={false}
                            text
                            onClick={() => { this.openSetNewReviewDateDialog = false; }}>
                            {this.omniaUxLoc.Common.Buttons.Cancel}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        )
    }

    renderUnpublishDialog(h) {
        return <opm-unpublish-process-dialog
            process={this.task.publishedProcess}
            unpublishHandler={this.unpublish}
            closeCallback={(unpublished) => {
                this.openUnpublishDialog = false;
                if (unpublished) {
                    this.task.sharePointTask.percentComplete = 1;
                }
            }}
        ></opm-unpublish-process-dialog>;
    }

    renderTitle(h) {
        let msg = this.task.publishedProcess ? '' : ` - ${this.coreLoc.Messages.UnauthorizedOrProcessNotFound}`
        return <div><p><a href="javascript:void(0)" onClick={this.viewProcess}>{this.task.sharePointTask.title}</a>{msg}</p></div>
    }

    renderReviewReminderTask(h) {
        if (this.task.sharePointTask.percentComplete == 1) {
            return [
                this.renderTitle(h),
                <div class="pt-4">{this.coreLoc.Messages.TaskCompleted}</div>,
                this.renderActions(h, true, false)
            ]
        }
        else if (!this.task.hasAuthorPermission) {
            return [
                this.renderTitle(h),
                <div class="pt-4">{this.coreLoc.Messages.AuthorPermissionIsRequried}</div>,
                this.renderActions(h, false, true)
            ]
        }
        else if (this.task.draftExists) {
            return [
                this.renderTitle(h),
                <div class="pt-4">{this.coreLoc.Messages.MessageDraftExist}</div>,
                this.renderActions(h, false, true)
            ]
        }
        else if (this.task.publishedProcess) {
            return [
                this.renderTitle(h),
                <div>{this.coreLoc.Messages.MessageReviewReminderTaskEditingDescription}</div>,
                this.renderActions(h, false, false),
                this.renderActionDialogs(h)
            ]
        }
        else {
            return [
                this.renderTitle(h),
                this.renderActions(h, false, true),
                this.renderActionDialogs(h)
            ]
        }
    }


    render(h) {
        return (
            <div>
                {
                    this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="table-heading"></v-skeleton-loader> :
                        this.renderReviewReminderTask(h)
                }
            </div>
        )
    }
}