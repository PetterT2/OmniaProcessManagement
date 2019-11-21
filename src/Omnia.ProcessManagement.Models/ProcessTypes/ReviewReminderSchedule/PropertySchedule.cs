using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.ReviewReminderSchedule
{
    public class PropertySchedule : ReviewReminderSchedule
    {
        public override ReviewReminderScheduleTypes Type
        {
            get
            {
                return ReviewReminderScheduleTypes.Property;
            }
        }

        public Guid DateTimeEnterprisePropertyDefinitionId { get; set; }
    }
}
