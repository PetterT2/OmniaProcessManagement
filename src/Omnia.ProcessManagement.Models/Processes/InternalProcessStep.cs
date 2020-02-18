using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class InternalProcessStep : ProcessStep
    {
        public override ProcessStepType Type => ProcessStepType.Internal;
        public string ProcessDataHash { get; set; }
        public List<ProcessStep> ProcessSteps { get; set; }
    }
}