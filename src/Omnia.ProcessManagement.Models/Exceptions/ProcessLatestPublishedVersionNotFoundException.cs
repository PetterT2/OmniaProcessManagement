using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessLatestPublishedVersionNotFoundException : Exception
    {
        public ProcessLatestPublishedVersionNotFoundException(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} does not have published version", innerException)
        {
        }
    }
}
