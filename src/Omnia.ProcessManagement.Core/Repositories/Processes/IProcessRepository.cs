using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    public interface IProcessRepository : IEnterprisePropertiesEntityRepository
    {
        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(Guid opmProcessId);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision);
        ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid processStepId, string hash);
        ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByIdAsync(Guid processId);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetProcessesDataAsync(Guid siteId, Guid webId, ProcessVersionType versionType);
        ValueTask<List<Process>> GetProcessesByOPMProcessIdsAsync(List<Guid> processIds, ProcessVersionType versionType);
        ValueTask<Process> BeforeApprovalProcessAsync(Guid opmProcessId, ProcessWorkingStatus processWorkingStatus);
        ValueTask<Process> UpdateProcessStatusAsync(Guid processId, ProcessWorkingStatus processWorkingStatus, ProcessVersionType versionType);
        ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsed(Guid processId, List<Guid> deletingProcessStepIds);
    }
}
