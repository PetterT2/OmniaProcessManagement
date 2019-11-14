using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessContentDuplicatedException : Exception
    {
        public ProcessContentDuplicatedException(Guid id, Exception? innerException = null) : base($"Process content with id: {id} is duplicated", innerException)
        {
        }
    }
}
