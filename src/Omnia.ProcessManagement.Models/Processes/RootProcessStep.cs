using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public enum ProcessWorkingStatus : byte
    {
        Draft = 0,
        Published = 1,
        SendingForApproval = 2,
        WaitingForApproval = 3,
        Publishing = 4,
        CancellingApproval = 5,
        FailedSendingForApproval = 6,
        FailedCancellingApproval = 7,
        FailedPublishing = 8
    }

    public class RootProcessStep : ProcessStep
    {
        public Dictionary<string, JToken> EnterpriseProperties { get; set; }
        public Guid ProcessTypeId { get; set; }
        public Guid ProcessTemplateId { get; set; }
        public int Edition { get; set; }
        public int Revision { get; set; }
        public string Comment { get; set; }
    }
}
