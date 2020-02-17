import { GuidValue, TimePeriodTypes, TimePeriodSettings } from '@omnia/fx-models';

export interface ReviewReminderTaskSettings {
    personEnterprisePropertyDefinitionId: GuidValue;
    expiration: TimePeriodSettings;
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ReviewReminderTaskSettingsFactory = {
    createDefault(): ReviewReminderTaskSettings {
        let settings: ReviewReminderTaskSettings = {
            expiration: {
                type: TimePeriodTypes.Months,
                value: 1
            },
            personEnterprisePropertyDefinitionId: null
        }

        return settings;
    }
}