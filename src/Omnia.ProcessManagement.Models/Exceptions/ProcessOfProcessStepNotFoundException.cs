using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessOfProcessStepNotFoundException : Exception
    {
        public ProcessOfProcessStepNotFoundException(Guid processStepId, Exception? innerException = null) : base($"Process of process step id: {processStepId} not found", innerException)
        {
        }
    }
}
