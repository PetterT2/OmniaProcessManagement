using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class RootProcessStep : ProcessStep
    {
        public Dictionary<string, JToken> EnterpriseProperties { get; set; }
        public Guid ProcessTemplateId { get; set; }
        public string Comment { get; set; }
    }
}
