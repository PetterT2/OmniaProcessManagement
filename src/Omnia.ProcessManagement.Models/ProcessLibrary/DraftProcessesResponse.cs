using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessLibrary
{
    public class DraftProcessesResponse
    {
        public int Total { get; set; }
        public List<Process> Processes { get; set; }
    }
}
