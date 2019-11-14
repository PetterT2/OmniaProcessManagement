using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessCheckedOutByAnotherUserException : Exception
    {
        public ProcessCheckedOutByAnotherUserException(Exception? innerException = null) : base($"Process has been checked out by another user", innerException)
        {
        }
    }
}
