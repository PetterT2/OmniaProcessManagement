using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    public interface IProcessService
    {
        ValueTask<Process> CheckInProcess(CheckInProcessModel model);
        ValueTask<Process> CheckOutProcess(Guid processId);
        ValueTask<Process> GetProcess(Guid processId);
        ValueTask<ProcessContent> GetMultilingualProcessContent(Guid processContentId);
    }
}
