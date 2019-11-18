using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class InternalProcessItem : ProcessItem
    {
        public override ProcessItemTypes Type => ProcessItemTypes.Internal;
        public List<ProcessItem> ProcessItems { get; set; }
        public Guid ProcessDataId { get; set; }
    }
}
