using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessPublishedVersionNotFoundException : Exception
    {
        public ProcessPublishedVersionNotFoundException(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} does not have published version", innerException)
        {
        }
    }
}
