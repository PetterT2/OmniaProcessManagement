using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessDataNotFoundException : Exception
    {
        public ProcessDataNotFoundException(Guid id, Exception? innerException = null) : base($"Process data with id: {id} not found", innerException)
        {
        }
    }
}
