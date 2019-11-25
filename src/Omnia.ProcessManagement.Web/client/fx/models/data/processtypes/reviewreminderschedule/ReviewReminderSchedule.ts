import { PropertySchedule } from './PropertySchedule';
import { TimeAfterPublishingSchedule } from './TimeAfterPublishingSchedule';
import { TimePeriodTypes } from '@omnia/fx-models';

export enum ReviewReminderScheduleTypes {
    /**
     * Specific time after publishing document
     * */
    TimeAfterPublishing = 0,
    /**
     * Document's date time enterprise property definition
     * */
    Property = 1
}

export interface ReviewReminderSchedule {
    type: ReviewReminderScheduleTypes;
}




/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ReviewReminderScheduleFactory = {
    createDefault(type: ReviewReminderScheduleTypes): ReviewReminderSchedule {
        let settings: ReviewReminderSchedule = null
        switch (type) {
            case ReviewReminderScheduleTypes.Property:
                settings = <PropertySchedule>{
                    type: ReviewReminderScheduleTypes.Property,
                    dateTimeEnterprisePropertyDefinitionId: null
                }
                break;
            case ReviewReminderScheduleTypes.TimeAfterPublishing:
                settings = <TimeAfterPublishingSchedule>{
                    type: ReviewReminderScheduleTypes.TimeAfterPublishing,
                    settings: {
                        type: TimePeriodTypes.Months,
                        value: 1
                    }
                }
                break;
        }

        return settings;
    }
}