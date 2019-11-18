using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class RootProcessItem : InternalProcessItem
    {
        public Dictionary<string, JToken> EnterpriseProperties { get; set; }
    }
}
