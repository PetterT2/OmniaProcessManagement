using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessStructureAndDrawingDataNotMatch : Exception
    {
        public ProcessStructureAndDrawingDataNotMatch(Exception? innerException = null) : base($"Process's structure and its drawing data not match", innerException)
        {
        }
    }
}
