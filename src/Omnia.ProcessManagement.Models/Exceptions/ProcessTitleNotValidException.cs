using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessTitleNotValidException : Exception
    {
        public ProcessTitleNotValidException(Exception? innerException = null) : base($"Process step title is required", innerException)
        {
        }
    }
}
