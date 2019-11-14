﻿using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class Process : OPMClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public string Data { get; set; }
        public string EnterpriseProperties { get; set; }
        public string CheckedOutBy { get; set; }
        public ProcessVersionType VersionType { get; set; }
        public ICollection<ProcessContent> ProcessContents { get; set; }
        public ICollection<ProcessMetadata> ProcessMetadata { get; set; }

    }

    internal enum ProcessVersionType
    {
        Draft = 0,
        CheckedOut = 1,
        Published = 2
    }
}
