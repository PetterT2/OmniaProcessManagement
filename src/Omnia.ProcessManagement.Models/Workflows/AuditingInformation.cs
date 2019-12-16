﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public class AuditingInformation
    {
        public AuditingInformation()
        {

        }

        public AuditingInformation(AuditingInformation auditingInformation)
        {
            CreatedBy = auditingInformation.CreatedBy;
            CreatedAt = auditingInformation.CreatedAt;
            ModifiedBy = auditingInformation.ModifiedBy;
            ModifiedAt = auditingInformation.ModifiedAt;
            DeletedAt = auditingInformation.DeletedAt;
        }

        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ModifiedAt { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }
    }
}
