using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class ProcessActionModel
    {
        public Process Process { get; set; }
        public Dictionary<Guid, ProcessData> ProcessData { get; set; }
        public Guid? DeletedProcessId { get; set; }
    }
}
