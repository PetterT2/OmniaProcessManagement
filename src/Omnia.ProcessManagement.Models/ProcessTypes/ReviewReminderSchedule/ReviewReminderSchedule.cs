using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.ReviewReminderSchedule
{
    public enum ReviewReminderScheduleTypes
    {
        /// <summary>
        /// Specific time after publishing document
        /// </summary>
        TimeAfterPublishing = 0,
        /// <summary>
        /// Document's date time enterprise property definition
        /// </summary>
        Property = 1
    }

    public class ReviewReminderSchedule : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public virtual ReviewReminderScheduleTypes Type { get; set; }
    }
}
