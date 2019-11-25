using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessStep
    {
        public Guid Id { get; set; }
        public string ProcessDataHash { get; set; }
        public MultilingualString Title { get; set; }
        public List<ProcessStep> ProcessSteps { get; set; }
    }
}