using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.ReviewReminders
{
    internal class ReviewReminderQueue : AuditingEntityBase
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public DateTimeOffset ReviewDate { get; set; }
        public DateTimeOffset ReviewReminderDate { get; set; }
        public bool Pending { get; set; }
        public string Log { get; set; }
    }
}
