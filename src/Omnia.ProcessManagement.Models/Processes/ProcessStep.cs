using Omnia.Fx.Models.JsonTypes;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessStep : OmniaJsonBase
    {
        public Guid Id { get; set; }
        public MultilingualString Title { get; set; }
        public virtual ProcessStepType Type { get; set; }

        public void ValidateTitle()
        {
            if (Title == null || Title.Count == 0 || Title.Values.Where(value => !string.IsNullOrEmpty(value)).Count() == 0)
            {
                throw new ProcessTitleNotValidException();
            }
        }
    }
}