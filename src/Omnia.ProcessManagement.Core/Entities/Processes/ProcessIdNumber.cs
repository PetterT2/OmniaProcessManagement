using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class ProcessIdNumber
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OPMProcessIdNumber { get; set; }
        public Guid OPMProcessId { get; set; }
    }
}
