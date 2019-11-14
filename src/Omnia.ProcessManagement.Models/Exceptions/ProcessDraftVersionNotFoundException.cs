using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessDraftVersionNotFoundException : Exception
    {
        public ProcessDraftVersionNotFoundException(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} does not have draft version", innerException)
        {
        }
    }
}
