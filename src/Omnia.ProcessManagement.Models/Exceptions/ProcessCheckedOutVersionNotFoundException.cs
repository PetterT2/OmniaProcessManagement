using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessCheckedOutVersionNotFoundException : Exception
    {
        public ProcessCheckedOutVersionNotFoundException(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} does not have checked-out version", innerException)
        {
        }
    }
}
