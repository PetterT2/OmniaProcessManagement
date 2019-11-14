using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessMetadataDuplicatedException : Exception
    {
        public ProcessMetadataDuplicatedException(Guid id, Exception? innerException = null) : base($"Process metadata with id: {id} is duplicated", innerException)
        {
        }
    }
}
