using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessDraftVersionExists : Exception
    {
        public ProcessDraftVersionExists(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} has a draft version.", innerException)
        {
        }
    }
}
