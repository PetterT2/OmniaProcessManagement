using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ExternalProcessItem : ProcessItem
    {
        public override ProcessItemTypes Type => ProcessItemTypes.External;

        public Guid ProcessUniqueId { get; set; }
    }
}
