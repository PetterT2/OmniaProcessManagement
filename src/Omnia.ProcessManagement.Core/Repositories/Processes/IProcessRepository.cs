using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    public interface IProcessRepository
    {
        ValueTask<Process> CheckInProcessAsync(CheckInProcessModel model);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> GetLatestPublishedProcessAsync(Guid opmProcessId);
        ValueTask<ProcessContent> GetMultilingualProcessContentAsync(Guid processContentId);
    }
}
