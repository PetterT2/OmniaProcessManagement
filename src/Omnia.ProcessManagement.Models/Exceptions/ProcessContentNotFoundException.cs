using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessContentNotFoundException : Exception
    {
        public ProcessContentNotFoundException(Guid id, Exception? innerException = null) : base($"Process content with id: {id} not found", innerException)
        {
        }
    }
}
