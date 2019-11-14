using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class InternalProcessItem : ProcessItem
    {
        public override ProcessItemTypes Type => ProcessItemTypes.Internal;

        public List<ProcessItem> Children { get; set; }

        public MultilingualProcessContentRef MultilingualProcessContentRef { get; set; }

        public Guid ProcessMetadataId { get; set; }
    }
}
