using Omnia.Fx.Models.TimePeriodSettings;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.ReviewReminderSchedule
{
    public class TimeAfterPublishingSchedule : ReviewReminderSchedule
    {
        public enum TimeAfterPublishingScheduleTypes
        {

        }

        public override ReviewReminderScheduleTypes Type
        {
            get
            {
                return ReviewReminderScheduleTypes.TimeAfterPublishing;
            }
        }

        public TimePeriodSettings Settings { get; set; }
    }
}
