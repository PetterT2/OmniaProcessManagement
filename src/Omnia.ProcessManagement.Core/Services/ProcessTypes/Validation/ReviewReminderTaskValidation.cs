using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class ReviewReminderTaskValidation
    {
        internal static void Validate(ReviewReminderTask task, EnterprisePropertySet set)
        {
            if (task.PersonEnterprisePropertyDefinitionId == Guid.Empty)
            {
                throw new Exception("ReviewReminderTask.PersonEnterprisePropertyDefinitionIds cannot be null or empty");
            }

            var personDefinition = set.Settings.Items.FirstOrDefault(i => i.EnterprisePropertyDefinitionId == task.PersonEnterprisePropertyDefinitionId && i.Type == Fx.Models.EnterpriseProperties.PropertyIndexedType.Person);

            if (personDefinition == null)
            {
                throw new Exception("ReviewReminderTask.PersonEnterprisePropertyDefinitionIds is invalid");
            }

        }
    }
}
