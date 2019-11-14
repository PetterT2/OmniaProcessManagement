using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class CheckInProcessModel
    {
        public Process Process { get; set; }
        public List<ProcessContent> ProcessContents { get; set; }
        public List<ProcessMetadata> ProcessMetadata { get; set; }
    }
}
