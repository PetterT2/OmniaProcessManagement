using Omnia.Fx.Contexts;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities
{
    /// <summary>
    /// In somecases, we don't use the Omnia Fx AuditingEntityBase to have full control of the auditing-information fit to OPM specific logic
    /// </summary>
    internal abstract class OPMAuditingEntityBase
    {
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public virtual DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ModifiedAt { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }


        public void SetAuditingInfo(IOmniaContext omniaContext, OPMAuditingEntityBase item)
        {
            var dateTime = DateTimeOffset.UtcNow;
            if (string.IsNullOrWhiteSpace(item.CreatedBy))
            {
                item.CreatedBy = omniaContext.Identity.LoginName;
            }
            if (item.CreatedAt == DateTimeOffset.MinValue)
            {
                item.CreatedAt = dateTime;
            }

            item.ModifiedAt = dateTime;
            item.ModifiedBy = omniaContext.Identity.LoginName;
        }
    }
}
