using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessRollup
{
    public class RollupProcessResult
    {
        public int Total { get; set; }
        public List<RollupProcess> Items { get; set; }
    }
}
