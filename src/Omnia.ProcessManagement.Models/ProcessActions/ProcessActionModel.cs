using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class ProcessActionModel
    {
        public string WebUrl { get; set; }
        public Process Process { get; set; }
        public Dictionary<Guid, ProcessData> ProcessData { get; set; }
    }
}
