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
        ValueTask<Process> CreateDraftProcessAsync(CreateDraftProcessModel createDraftProcessModel);
        ValueTask<Process> CheckInProcessAsync(CheckInProcessModel checkInProcessModel);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
    }
}
