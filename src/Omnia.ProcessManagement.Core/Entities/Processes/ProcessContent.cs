using Omnia.Fx.Models.Language;
using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class ProcessContent : OPMClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public Guid RootProcessId { get; set; }
        public LanguageTag LanguageTag { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }

        [ForeignKey("RootProcessId")]
        public virtual Process RootProcess { get; set; }
    }
}
