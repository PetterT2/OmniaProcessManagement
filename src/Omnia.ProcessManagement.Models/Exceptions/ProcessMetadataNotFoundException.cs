using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessMetadataNotFoundException : Exception
    {
        public ProcessMetadataNotFoundException(Guid id, Exception? innerException = null) : base($"Process metadata with id: {id} not found", innerException)
        {
        }
    }
}
