using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessItem : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public enum ProcessItemTypes
        {
            Undefined = 0,
            Internal = 1,
            External = 2,
            CustomLink = 3
        }

        public virtual ProcessItemTypes Type { get; set; } = ProcessItemTypes.Undefined;

        public MultilingualProcessContentRef MultilingualProcessContentRef { get; set; }
    }
}
