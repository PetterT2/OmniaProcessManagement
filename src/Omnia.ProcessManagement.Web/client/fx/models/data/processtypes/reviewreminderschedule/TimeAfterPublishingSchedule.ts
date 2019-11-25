import { ReviewReminderSchedule, ReviewReminderScheduleTypes } from './ReviewReminderSchedule';
import { TimePeriodSettings } from '@omnia/fx-models';

export interface TimeAfterPublishingSchedule extends ReviewReminderSchedule {
    type: ReviewReminderScheduleTypes.TimeAfterPublishing
    settings: TimePeriodSettings;
}