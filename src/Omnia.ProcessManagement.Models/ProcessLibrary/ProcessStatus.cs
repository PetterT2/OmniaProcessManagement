using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessLibrary
{
    public class ProcessStatus
    {
        public ProcessWorkingStatus ProcessWorkingStatus { get; set; }
        public string CheckedOutBy { get; set; }
    }
}
