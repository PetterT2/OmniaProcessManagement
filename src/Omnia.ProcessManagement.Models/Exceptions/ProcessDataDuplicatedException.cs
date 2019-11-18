using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessDataDuplicatedException : Exception
    {
        public ProcessDataDuplicatedException(Guid id, Exception? innerException = null) : base($"Process data with id: {id} is duplicated", innerException)
        {
        }
    }
}
