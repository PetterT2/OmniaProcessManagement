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
        ValueTask<Process> CreateDraftProcessAsync(CreateDraftProcessModel createDraftProcessModel);
        ValueTask<Process> CheckInProcessAsync(CheckInProcessModel checkInProcessModel);
        ValueTask<Process> CheckOutProcessAsync(Guid processId);
        ValueTask<Process> GetProcessAsync(Guid processId);
        ValueTask<ProcessContent> GetMultilingualProcessContentAsync(Guid processContentId);
    }
}
