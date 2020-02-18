using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ExternalProcessStep : ProcessStep
    {
        public override ProcessStepType Type => ProcessStepType.External;
        public Guid OPMProcessId { get; set; }
    }
}