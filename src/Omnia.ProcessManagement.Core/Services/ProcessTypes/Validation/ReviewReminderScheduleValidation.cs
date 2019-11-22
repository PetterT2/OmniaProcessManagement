using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessTypes.ReviewReminderSchedule;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class ReviewReminderScheduleValidation
    {
        internal static ReviewReminderSchedule Validate(ReviewReminderSchedule reviewReminderSchedule, EnterprisePropertySet set)
        {
            switch (reviewReminderSchedule.Type)
            {
                case ReviewReminderScheduleTypes.Property:
                    var propertySchedule = CleanModel<PropertySchedule>(reviewReminderSchedule);
                    Validate(propertySchedule, set);
                    return propertySchedule;
                default:
                    return CleanModel<TimeAfterPublishingSchedule>(reviewReminderSchedule);
            }

        }

        private static void Validate(PropertySchedule propertySchedule, EnterprisePropertySet set)
        {
            if (propertySchedule.DateTimeEnterprisePropertyDefinitionId == null ||
                propertySchedule.DateTimeEnterprisePropertyDefinitionId == Guid.Empty ||
                set.Settings.Items == null ||
                set.Settings.Items.Count == 0 ||
                set.Settings.Items.FirstOrDefault(i => i.EnterprisePropertyDefinitionId == propertySchedule.DateTimeEnterprisePropertyDefinitionId &&
                i.Type == Fx.Models.EnterpriseProperties.PropertyIndexedType.DateTime) == null)
                throw new Exception("Invalid DateTimeEnterprisePropertyDefinitionId in PropertySchedule");
        }

        private static T CleanModel<T>(ReviewReminderSchedule schedule) where T : ReviewReminderSchedule, new()
        {
            var scheduleSettings = schedule.Cast<ReviewReminderSchedule, T>();
            if (scheduleSettings.AdditionalProperties != null)
            {
                scheduleSettings.AdditionalProperties.Clear();
            }

            return scheduleSettings;
        }
    }
}
