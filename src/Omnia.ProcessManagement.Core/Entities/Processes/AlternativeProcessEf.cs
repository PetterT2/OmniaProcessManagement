using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class AlternativeProcessEF : OPMAuditingEntityBase
    {
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public string CheckedOutBy { get; set; }
        public Guid TeamAppId { get; set; }
        public Guid SecurityResourceId { get; set; }
        public ProcessWorkingStatus ProcessWorkingStatus { get; set; }
        public ProcessVersionType VersionType { get; set; }
        public string JsonValue { get; set; }
        public DateTimeOffset? PublishedAt { get; set; }
        public string PublishedBy { get; set; }
    }

    internal class AlternativeProcessEFWithoutData
    {
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public string CheckedOutBy { get; set; }
        public Guid TeamAppId { get; set; }
        public Guid SecurityResourceId { get; set; }
        public ProcessWorkingStatus ProcessWorkingStatus { get; set; }
        public ProcessVersionType VersionType { get; set; }
    }
}
