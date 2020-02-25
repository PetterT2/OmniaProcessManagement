using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class InvalidRootProcessStepIdException : Exception
    {
        public InvalidRootProcessStepIdException(Guid opmProcessId, Guid oldRootProcessStepId, Guid newRootProcessStepId, Exception? innerException = null) 
            : base($"Not allow to change process's root process step id. OPMProcessId: {opmProcessId}, OldStepId: {oldRootProcessStepId}, NewStepId: {newRootProcessStepId}", innerException)
        {
        }
    }
}
