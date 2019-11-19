using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class ProcessActionModel
    {
        public Guid SiteId { get; set; }
        public Guid WebId { get; set; }
        public Process Process { get; set; }
        public Dictionary<Guid, ProcessData> ProcessData { get; set; }
    }
}
