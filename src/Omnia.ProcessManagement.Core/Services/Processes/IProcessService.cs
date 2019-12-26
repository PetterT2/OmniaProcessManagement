using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
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
        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(Guid opmProcessId);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId);
        ValueTask UnpublishProcessAsync(Guid opmProcessId, Guid processTypeId, string webUrl);

        ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion);
        ValueTask UpdateLatestPublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus);

        ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByIdAsync(Guid processId);
        ValueTask<Process> GetProcessByOPMProcessIdAsync(Guid opmProcessId, DraftOrLatestPublishedVersionType versionType);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetAuthorizedProcessesAsync(AuthorizedProcessQuery processQuery);
        ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrLatestPublishedVersionType versionType);
        ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds);
        ValueTask<Dictionary<Guid, ProcessWorkingStatus>> GetProcessWorkingStatusAsync(AuthorizedProcessQuery processQuery);
        internal ValueTask<InternalProcess> GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType);
        internal ValueTask<InternalProcess> GetInternalProcessByProcessIdAsync(Guid processId);
        internal ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, ProcessVersionType versionType);
        internal ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, string hash, ProcessVersionType versionType);
    }
}
