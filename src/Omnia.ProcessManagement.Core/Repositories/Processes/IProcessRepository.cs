using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    internal interface IProcessRepository : IEnterprisePropertiesEntityRepository
    {
        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(Guid opmProcessId);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId);
        ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByIdAsync(Guid processId);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetProcessesAsync(AuthorizedProcessQuery processQuery);
        ValueTask<Process> BeforeApprovalProcessAsync(Guid opmProcessId, ProcessWorkingStatus processWorkingStatus);
        ValueTask<Process> UpdateProcessStatusAsync(Guid processId, ProcessWorkingStatus processWorkingStatus, ProcessVersionType versionType);
        ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsed(Guid processId, List<Guid> deletingProcessStepIds);
        ValueTask<List<InternalProcess>> GetInternalProcessesAsync(AuthorizedInternalProcessQuery processQuery);
        ValueTask<InternalProcess> GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType);
        ValueTask<InternalProcess> GetInternalProcessByProcessIdAsync(Guid processId);
        ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, ProcessVersionType versionType);
        ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, string hash, ProcessVersionType versionType);
    }
}
