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
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ModifiedAt { get; set; }
    }
}
