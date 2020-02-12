using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessVersionNotFoundException : Exception
    {
        public ProcessVersionNotFoundException(Guid opmProcessId, int edition, int revision, Exception? innerException = null) : base($"Process with opmProcessId: {opmProcessId}, edition: {edition}, revision:{revision} not found", innerException)
        {
        }
    }
}
