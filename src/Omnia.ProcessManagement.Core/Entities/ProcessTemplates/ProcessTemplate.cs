using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ProcessTemplates
{
    internal class ProcessTemplate : ClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }

        public string JsonValue { get; set; }
    }

}
