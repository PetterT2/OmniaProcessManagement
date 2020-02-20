using Omnia.Fx.Models.JsonTypes;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessStep : OmniaJsonBase
    {
        public Guid Id { get; set; }
        public MultilingualString Title { get; set; }
        public virtual ProcessStepType Type { get; set; }
    }
}