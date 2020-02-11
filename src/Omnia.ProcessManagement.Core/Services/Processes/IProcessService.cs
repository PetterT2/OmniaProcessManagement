using Omnia.Fx.Models.Queries;
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
        //Main process actions

        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CreateDraftProcessAsync(Guid opmProcessId);
        ValueTask<Process> CheckInProcessAsync(Guid opmProcessId);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId);
        ValueTask UnpublishProcessAsync(Guid opmProcessId);
        ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion);
        ValueTask UpdatePublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus);
        ValueTask UpdatePublishedProcessWorkingStatusAndVersionTypeAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, ProcessVersionType newVersionType);


        ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash);
        ValueTask<Process> GetProcessByVersionAsync(Guid opmProcessId, int edition, int revision);
        ValueTask<Process> GetProcessByIdAsync(Guid processId);
        ValueTask<Process> GetProcessByOPMProcessIdAsync(Guid opmProcessId, DraftOrPublishedVersionType versionType);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetAuthorizedProcessesAsync(IAuthorizedProcessQuery processQuery);
        ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrPublishedVersionType versionType);
        ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds);
        ValueTask<Dictionary<Guid, ProcessWorkingStatus>> GetProcessWorkingStatusAsync(IAuthorizedProcessQuery processQuery);
        ValueTask<bool> CheckIfDraftExist(Guid opmProcessId);
        internal ValueTask<InternalProcess> GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType);
        internal ValueTask<InternalProcess> GetInternalProcessByProcessIdAsync(Guid processId);
        internal ValueTask<InternalProcess> GetInternalPublishedProcessByProcessStepIdAsync(Guid processStepId);
        internal ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processStepId, string hash);
        internal ValueTask<Dictionary<Guid, ProcessData>> GetAllProcessDataAsync(Guid processId);
        ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery, string securityTrimmingQuery, List<string> filterQueries);
        ValueTask<List<Process>> GetProcessHistoryAsync(IAuthorizedProcessQuery processQuery);
    }
}
