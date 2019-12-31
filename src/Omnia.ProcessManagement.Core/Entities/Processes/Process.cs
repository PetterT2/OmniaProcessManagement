﻿using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Images;
using Omnia.ProcessManagement.Models.Enums;
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
        public string JsonValue { get; set; }
        public string EnterpriseProperties { get; set; }
        public string CheckedOutBy { get; set; }
        public Guid TeamAppId { get; set; }
        public Guid SecurityResourceId { get; set; }
        public ProcessWorkingStatus ProcessWorkingStatus { get; set; }
        public ProcessVersionType VersionType { get; set; }
        public ICollection<ProcessData> ProcessData { get; set; }
        public ICollection<Image> Images { get; set; }
    }
}
