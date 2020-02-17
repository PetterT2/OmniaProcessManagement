using Omnia.Fx.Models.TimePeriodSettings;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    public class ReviewReminder
    {
        public ReviewReminderSchedule.ReviewReminderSchedule Schedule { get; set; }
        public TimePeriodSettings ReminderInAdvance { get; set; }

        /// <summary>
        /// null means no task creation
        /// </summary>
        public ReviewReminderTaskSettings Task { get; set; }

        /// <summary>
        /// There is special value for defining approver
        /// <see cref="ProcessTypeItemSettings.ApproverGroupId"/>
        /// </summary>
        public List<Guid> PersonEnterprisePropertyDefinitionIds { get; set; }
    }

    public class ReviewReminderTaskSettings
    {
        public Guid PersonEnterprisePropertyDefinitionId { get; set; }
        public TimePeriodSettings Expiration { get; set; }
    }
}
