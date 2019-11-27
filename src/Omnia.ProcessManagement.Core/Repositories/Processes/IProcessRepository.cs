using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    public interface IProcessRepository
    {
        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId);
        ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid processStepId, string hash);
        ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType);
        ValueTask<Process> GetProcessById(Guid processId, ProcessVersionType versionType);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetProcessesDataAsync(Guid siteId, Guid webId);
    }
}
