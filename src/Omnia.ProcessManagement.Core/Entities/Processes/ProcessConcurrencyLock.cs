using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    /// <summary>
    /// We use this lock table to prevent from concurrency action
    /// </summary>
    internal class ProcessConcurrencyLock : AuditingEntityBase
    {
        [Key]
        public Guid OPMProcessId { get; set; }
    }
}
