﻿using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Workflows
{
    internal class WorkflowTask : OPMClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public Guid WorkflowId { get; set; }
        public bool IsCompleted { get; set; }
        public string Comment { get; set; }
        public string AssignedUser { get; set; }
        public int SPTaskId { get; set; }
        public Guid TeamAppId { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }
        public TaskOutcome TaskOutcome { get; set; }
        public Workflow Workflow { get; set; }
    }
}
