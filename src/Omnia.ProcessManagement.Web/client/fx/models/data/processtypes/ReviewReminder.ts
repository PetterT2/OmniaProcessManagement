import { ReviewReminderSchedule, ReviewReminderScheduleTypes, ReviewReminderScheduleFactory } from './reviewreminderschedule';
import { GuidValue, TimePeriodSettings, TimePeriodTypes  } from '@omnia/fx-models';
import { ReviewReminderTask } from '.';

export interface ReviewReminder {
    schedule: ReviewReminderSchedule;
    reminderInAdvance: TimePeriodSettings;

    /**
     * null means no task creation
     * */
    task?: ReviewReminderTask;

    /**
     * who should receive the reminder email
     * There is a spacial value for defining approver : ApproverId - 3d2cbf30-181a-4bf8-afc9-b7a9744bf760
     * */
    personEnterprisePropertyDefinitionIds: Array<GuidValue>;
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ReviewReminderFactory = {
    createDefault(type: ReviewReminderScheduleTypes = ReviewReminderScheduleTypes.TimeAfterPublishing): ReviewReminder {
        let settings: ReviewReminder = {
            schedule: ReviewReminderScheduleFactory.createDefault(type),
            reminderInAdvance: {
                type: TimePeriodTypes.Days,
                value: 30
            },
            personEnterprisePropertyDefinitionIds: [],
            task: null
        }

        return settings;
    }
}
