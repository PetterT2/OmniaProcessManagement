import { ReviewReminderSchedule, ReviewReminderScheduleTypes } from './ReviewReminderSchedule';
import { GuidValue } from '@omnia/fx-models';

export interface PropertySchedule extends ReviewReminderSchedule {
    type: ReviewReminderScheduleTypes.Property
    dateTimeEnterprisePropertyDefinitionId: GuidValue;
}