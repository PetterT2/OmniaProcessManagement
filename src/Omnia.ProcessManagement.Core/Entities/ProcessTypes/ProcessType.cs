using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ProcessTypes
{
    internal class ProcessType : ClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }

        public string Title { get; set; }

        public Guid RootId { get; set; }

        public string JsonValue { get; set; }
    }
}
