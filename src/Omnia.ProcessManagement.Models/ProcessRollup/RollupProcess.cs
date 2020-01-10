using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessRollup
{
    public class RollupProcess
    {
        public Guid Id { get; set; }
        public Dictionary<string, object> Properties { get; set; }
    }
}
