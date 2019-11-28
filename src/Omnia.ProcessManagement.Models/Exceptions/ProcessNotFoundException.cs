using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessNotFoundException : Exception
    {
        public ProcessNotFoundException(Guid id, Exception? innerException = null) : base($"Process with id: {id} not found", innerException)
        {
        }
    }
}
