using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessCannotBeArchivedWhenDraftVersionExists : Exception
    {
        public ProcessCannotBeArchivedWhenDraftVersionExists(Guid opmProcessId, Exception? innerException = null) : base($"Process with OPMProcessId: {opmProcessId} cannot be archived because there's a draft version exists.", innerException)
        {
        }
    }
}
