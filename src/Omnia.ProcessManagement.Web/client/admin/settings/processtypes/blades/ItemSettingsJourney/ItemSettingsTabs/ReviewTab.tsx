﻿import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { DocumentType, DocumentTypeItemSettings, ApproverId, ReviewReminderFactory, ReviewReminderScheduleTypes, ReviewReminderScheduleFactory, TimeAfterPublishingSchedule, PropertySchedule, ReviewReminderSchedule, ReviewReminder, ReviewReminderTaskFactory, ReviewReminderTask } from '../../../../../../fx/models';
import { EnterprisePropertyDefinition, PropertyIndexedType, GuidValue, TimePeriodTypes } from '@omnia/fx-models';
import { ProcessTypeHelper } from '../../../core';

interface ReviewTabProps {
    formValidator: FormValidator;
    documentType: DocumentType;
}

@Component
export default class ReviewTab extends VueComponentBase<ReviewTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() documentType: DocumentType;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;


    private enableReviewReminder = false;
    private enableCreateReviewTask = false;

    //private selectingReviewReminderScheduleType: ReviewReminderScheduleTypes = null;
    //private periodTypes: Array<{ id: TimePeriodTypes, title: string }> = [
    //    { id: TimePeriodTypes.Days, title: this.loc.TimePeriodTypes.Days },
    //    { id: TimePeriodTypes.Months, title: this.loc.TimePeriodTypes.Months },
    //    { id: TimePeriodTypes.Years, title: this.loc.TimePeriodTypes.Years }
    //]

    //created() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (settings.reviewReminder) {
    //        this.enableReviewReminder = true;
    //        this.selectingReviewReminderScheduleType = settings.reviewReminder.schedule.type;

    //        if (settings.reviewReminder.task) {
    //            this.enableCreateReviewTask = true;

    //        }
    //    }
    //}

    //onEnableReviewReminderChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (this.enableReviewReminder) {
    //        settings.reviewReminder = ReviewReminderFactory.createDefault();
    //        this.selectingReviewReminderScheduleType = settings.reviewReminder.schedule.type;
    //    }
    //    else {
    //        settings.reviewReminder = null;
    //        this.enableCreateReviewTask = false;
    //    }
    //}

    //onReviewReminderScheduleTypeChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;

    //    settings.reviewReminder.schedule = ReviewReminderScheduleFactory.createDefault(this.selectingReviewReminderScheduleType);
    //}

    //onEnableCreateReviewTaskChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;

    //    if (this.enableCreateReviewTask) {
    //        settings.reviewReminder.task = ReviewReminderTaskFactory.createDefault()
    //    } else {
    //        settings.reviewReminder.task = null;
    //    }
    //}


    //renderCreateTask(h, task: ReviewReminderTask) {
    //    return (
    //        <v-card>
    //            <v-card-text>
    //                <v-select item-value="id" item-text="multilingualTitle"
    //                    items={DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.Person)}
    //                    v-model={task.personEnterprisePropertyDefinitionId}></v-select>
    //                <omfx-field-validation
    //                    useValidator={this.formValidator}
    //                    checkValue={task.personEnterprisePropertyDefinitionId}
    //                    rules={
    //                        new FieldValueValidation().IsRequired().getRules()
    //                    }>
    //                </omfx-field-validation>
    //                <omfx-time-period-picker dark={this.omniaTheming.promoted.body.dark} label={this.loc.TaskExpireIn}
    //                    min={0} model={task.expiration}
    //                    onModelChange={(model) => { task.expiration = model }}></omfx-time-period-picker>
    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //renderReviewReminderSettings(h, reviewReminder: ReviewReminder) {
    //    let recipients = [
    //        ...DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.Person),
    //        { multilingualTitle: this.loc.Approver, id: ApproverId } as EnterprisePropertyDefinition
    //    ]
    //    return (
    //        <v-card>
    //            <v-card-text>
    //                <omfx-time-period-picker dark={this.omniaTheming.promoted.body.dark} label={this.loc.SendReminderInAdvance}
    //                    min={0} model={reviewReminder.reminderInAdvance}
    //                    onModelChange={(model) => { reviewReminder.reminderInAdvance = model }}></omfx-time-period-picker>
    //                <v-select chips deletable-chips item-value="id" item-text="multilingualTitle"
    //                    label={this.loc.ReviewReminderRecipients}
    //                    items={recipients}
    //                    v-model={reviewReminder.personEnterprisePropertyDefinitionIds} multiple></v-select>
    //                <v-checkbox label={this.loc.CreateTask}
    //                    onChange={(val) => { this.enableCreateReviewTask = val; this.onEnableCreateReviewTaskChanged() }}
    //                    input-value={this.enableCreateReviewTask}></v-checkbox>
    //                {
    //                    this.enableCreateReviewTask && this.renderCreateTask(h, reviewReminder.task)
    //                }
    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //renderReviewReminderSchdule(h, schedule: ReviewReminderSchedule) {

    //    return (
    //        <v-card class="mb-4">
    //            <v-card-text>
    //                <v-radio-group hide-details class="mt-1" name="documentTypeReviewReminderTypes" v-model={this.selectingReviewReminderScheduleType}>
    //                    <v-radio label={this.loc.ReviewReminderScheduleTypes.TimeAfterPublishing}
    //                        value={ReviewReminderScheduleTypes.TimeAfterPublishing}
    //                        onChange={() => {
    //                            this.selectingReviewReminderScheduleType = ReviewReminderScheduleTypes.TimeAfterPublishing;
    //                            this.onReviewReminderScheduleTypeChanged();
    //                        }}></v-radio>
    //                </v-radio-group>
    //                {
    //                    this.selectingReviewReminderScheduleType == ReviewReminderScheduleTypes.TimeAfterPublishing &&
    //                    <div class="ml-4">
    //                        <omfx-time-period-picker
    //                            dark={this.omniaTheming.promoted.body.dark}
    //                            min={1} model={(schedule as TimeAfterPublishingSchedule).settings}
    //                            onModelChange={(model) => { (schedule as TimeAfterPublishingSchedule).settings = model }}></omfx-time-period-picker>
    //                    </div>
    //                }

    //                <v-radio-group hide-details class="mt-1" name="documentTypeReviewReminderTypes" v-model={this.selectingReviewReminderScheduleType}>
    //                    <v-radio label={this.loc.ReviewReminderScheduleTypes.Property}
    //                        value={ReviewReminderScheduleTypes.Property}
    //                        onChange={() => {
    //                            this.selectingReviewReminderScheduleType = ReviewReminderScheduleTypes.Property;
    //                            this.onReviewReminderScheduleTypeChanged();
    //                        }}></v-radio>
    //                </v-radio-group>

    //                {this.selectingReviewReminderScheduleType == ReviewReminderScheduleTypes.Property &&
    //                    [
    //                        <v-select class="ml-4" item-value="id" item-text="multilingualTitle"
    //                            items={DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.DateTime)}
    //                            v-model={(schedule as PropertySchedule).dateTimeEnterprisePropertyDefinitionId}></v-select>,
    //                        <omfx-field-validation
    //                            useValidator={this.formValidator}
    //                            checkValue={(schedule as PropertySchedule).dateTimeEnterprisePropertyDefinitionId}
    //                            rules={
    //                                new FieldValueValidation().IsRequired().getRules()
    //                            }>
    //                        </omfx-field-validation>
    //                    ]
    //                }

    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //render(h) {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    let feedbackRecipients = [
    //        ...DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.Person),
    //        { multilingualTitle: this.loc.Approver, id: ApproverId } as EnterprisePropertyDefinition
    //    ]
    //    return (
    //        <div>
    //            <v-select chips deletable-chips item-value="id" item-text="multilingualTitle"
    //                label={this.loc.FeedbackRecipients}
    //                items={feedbackRecipients}
    //                v-model={settings.feedbackRecipientsPropertyDefinitionIds} multiple></v-select>
    //            <v-checkbox label={this.loc.ReviewReminder} onChange={(val) => { this.enableReviewReminder = val; this.onEnableReviewReminderChanged() }} input-value={this.enableReviewReminder}></v-checkbox>
    //            {
    //                this.enableReviewReminder && this.renderReviewReminderSchdule(h, settings.reviewReminder.schedule)
    //            }
    //            {
    //                this.enableReviewReminder && this.renderReviewReminderSettings(h, settings.reviewReminder)
    //            }
    //        </div>
    //    );
    //}
}