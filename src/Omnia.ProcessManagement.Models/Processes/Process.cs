﻿using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class Process
    {
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public InternalProcessItem Data { get; set; }
        public Dictionary<string, JToken> EnterpriseProperties { get; set; }
        public string CheckedOutBy { get; set; }
    }
}
