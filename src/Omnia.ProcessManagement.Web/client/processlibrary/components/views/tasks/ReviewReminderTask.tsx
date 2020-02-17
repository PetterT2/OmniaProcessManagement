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
import { WorkflowTask, Enums, ProcessWorkingStatus, WorkflowCompletedType, TaskOutcome, ReviewReminderTask } from '../../../../fx/models';
import { UrlParameters } from '../../../Constants';
import { OPMContext } from '../../../../fx/contexts';
import { ProcessDesignerStore } from '../../../../processdesigner/stores';
import { ProcessStore, OPMUtils, OPMRouter, ProcessRendererOptions } from '../../../../fx';

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


    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);

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
        this.reviewReminderService.closeReviewReminderTask(parseInt(this.taskId), this.opmContext.teamAppId)
            .then(() => {
                this.task.sharePointTask.percentComplete = 1;
            })
            .catch((errorMessage: string) => {
                this.errorMessage = errorMessage;
            });
    }

    setNewReviewDate() {
        this.reviewReminderService.setNewReviewDate(parseInt(this.taskId), this.opmContext.teamAppId, this.newReviewDate)
            .then(() => {
                this.task.sharePointTask.percentComplete = 1;
            })
            .catch((errorMessage: string) => {
                this.errorMessage = errorMessage;
            });
    }

    createDraft() {
        this.$confirm.open({}).then(res => {
            if (res == ConfirmDialogResponse.Ok) {
                this.processStore.actions.createDraftFromPublished.dispatch(this.task.sharePointTask.opmProcessId).then(() => {
                    this.closeTask();
                })
            }
        })
    }

    viewProcess(e: MouseEvent) {
        let process = this.task.publishedProcess;
        if (this.previewPageUrl) {
            var viewUrl = OPMUtils.createProcessNavigationUrl(process, process .rootProcessStep, this.previewPageUrl, false);
            var win = window.open(viewUrl, '_blank');
            win.focus();
        } else {
            OPMRouter.navigate(process, process .rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
        }
    }

    renderActions(h, taskCompleted: boolean, authorized: boolean = false) {
        return [
            <v-layout class='mt-4'>
                <v-flex>
                    <v-btn text onClick={() => { this.closeCallback() }}>{this.omniaUxLoc.Common.Buttons.Cancel}</v-btn>
                </v-flex>

                {
                    authorized && !taskCompleted &&
                    <v-flex class="text-right">
                        <v-btn onClick={() => { this.openSetNewReviewDateDialog = true; }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.SetNewReviewDate}</v-btn>
                        <v-btn onClick={() => { this.openUnpublishDialog = true; }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.Unpublish}</v-btn>
                        <v-btn onClick={() => { this.createDraft() }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.CreateDraft}</v-btn>
                    </v-flex>
                }
                {
                    !authorized && !taskCompleted &&
                    <v-flex class="text-right">
                        <v-btn onClick={() => { this.closeTask() }} dark color={this.omniaTheming.themes.primary.base}>{this.coreLoc.ProcessActions.CloseTask}</v-btn>
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
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                maxWidth="800"
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.openSetNewReviewDateDialog = false }}
                model={{ visible: true }}
                hideCloseButton
                position={DialogPositions.Center}>

                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                    <v-toolbar-title>{this.coreLoc.ProcessActions.SetNewReviewDate}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={() => { this.openSetNewReviewDateDialog = false }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    <omfx-date-time-picker
                        model={this.newReviewDate}
                        color={this.omniaTheming.themes.primary.base}
                        dark={this.omniaTheming.promoted.body.dark}
                        pickerMode={"date"}
                        formatter={this.formatter}
                        onModelChange={(newVal) => { this.newReviewDate = newVal; }}>
                    </omfx-date-time-picker>
                </v-container>
                <div class="text-right">
                    <v-btn
                        disabled={!this.newReviewDate}
                        dark={this.newReviewDate}
                        color={this.omniaTheming.themes.primary.base}
                        onClick={() => { this.setNewReviewDate() }}>
                        {this.omniaUxLoc.Common.Buttons.Ok}
                    </v-btn>
                    <v-btn
                        dark={this.omniaTheming.promoted.body.dark}
                        text
                        onClick={() => { this.openSetNewReviewDateDialog = false; }}>
                        {this.omniaUxLoc.Common.Buttons.Cancel}
                    </v-btn>
                </div>
            </omfx-dialog>
        )
    }

    renderUnpublishDialog(h) {
        return <opm-unpublish-process-dialog
            process={this.task.publishedProcess}
            closeCallback={(unpublished) => {
                if (unpublished) {
                    this.task.sharePointTask.percentComplete = 1;
                }
            }}
        ></opm-unpublish-process-dialog>;
    }

    renderReviewReminderTask(h) {
        if (this.task.sharePointTask.percentComplete == 1) {
            return [
                <div class="pt-4">{this.coreLoc.Messages.TaskCompleted}</div>,
                this.renderActions(h, true)
            ]
        }
        else if (!this.task.hasAuthorPermission) {
            return [
                <div class="pt-4">{this.coreLoc.Messages.AuthorPermissionIsRequried}</div>,
                this.renderActions(h, false, false)
            ]
        }
        else {
            return [
                <div><p><a onClick={this.viewProcess}>{this.task.sharePointTask.title}</a></p></div>,
                <div>{this.coreLoc.Messages.MessageReviewReminderTaskEditingDescription}</div>,
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