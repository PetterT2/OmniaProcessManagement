using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class Process 
    {
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public RootProcessStep RootProcessStep { get; set; }
        public string CheckedOutBy { get; set; }
        public ProcessVersionType VersionType { get; set; }
        public Guid SiteId { get; set; }
        public Guid WebId { get; set; }
        public ProcessWorkingStatus ProcessWorkingStatus { get; set; }
        public string SecurityResourceId { get; set; }
    }
}
