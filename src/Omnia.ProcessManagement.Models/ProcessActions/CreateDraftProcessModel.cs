using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class CreateDraftProcessModel
    {
        public MultilingualString Title { get; set; }
        public Dictionary<string, JToken> EnterpriseProperties { get; set; }

        public bool CheckOut { get; set; }
    }
}
