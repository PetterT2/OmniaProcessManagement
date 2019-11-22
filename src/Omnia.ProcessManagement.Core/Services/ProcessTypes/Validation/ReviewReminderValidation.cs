using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class ReviewReminderValidation
    {
        internal static void Validate(ReviewReminder reviewReminder, EnterprisePropertySet set)
        {
            if (reviewReminder.Schedule == null)
                throw new Exception("ReviewReminder.Schedule cannot be null");

            reviewReminder.Schedule = ReviewReminderScheduleValidation.Validate(reviewReminder.Schedule, set);

            if (reviewReminder.PersonEnterprisePropertyDefinitionIds != null && reviewReminder.PersonEnterprisePropertyDefinitionIds.Count > 0)
            {
                foreach (var id in reviewReminder.PersonEnterprisePropertyDefinitionIds)
                {
                    if (id != ProcessTypeItemSettings.ApproverGroupId)
                    {
                        var personDefinition = set.Settings.Items?.FirstOrDefault(i => i.EnterprisePropertyDefinitionId == id && i.Type == Fx.Models.EnterpriseProperties.PropertyIndexedType.Person);

                        if (personDefinition == null)
                            throw new Exception("ReviewReminder.PersonEnterprisePropertyDefinitionIds is invalid");
                    }
                }
            }

            if (reviewReminder.Task != null)
            {
                ReviewReminderTaskValidation.Validate(reviewReminder.Task, set);
            }
        }
    }
}
