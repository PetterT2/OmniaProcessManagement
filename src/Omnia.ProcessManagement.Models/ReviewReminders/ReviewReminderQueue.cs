using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ReviewReminders
{
    public class ReviewReminderQueue
    {
        public int Id { get; set; }
        public Guid OPMProcessId { get; set; }

        public DateTimeOffset ReviewDate { get; set; }

        public DateTimeOffset ReviewReminderDate { get; set; }
    }
}
