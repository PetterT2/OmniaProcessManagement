using Omnia.Fx.Models.Queries;
using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.Fx.NetCore.Utils.Query;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
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
        //Main process actions

        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CreateDraftProcessAsync(Guid opmProcessId);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(Guid opmProcessId);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId);
        ValueTask<Process> UnpublishProcessAsync(Guid opmProcessId);
        ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion);
        ValueTask UpdatePublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus);
        ValueTask UpdatePublishedProcessWorkingStatusAndVersionTypeAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, ProcessVersionType newVersionType);


        ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQueryHelper itemQuery);
        ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType);
        ValueTask<Process> GetProcessByIdAsync(Guid processId);
        ValueTask<Process> GetProcessByOPMProcessIdAsync(Guid opmProcessId, DraftOrPublishedVersionType versionType);
        ValueTask<bool> CheckIfDraftExist(Guid opmProcessId);
        ValueTask DeleteDraftProcessAsync(Guid opmProcessId);
        ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrPublishedVersionType versionType);
        ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds);


        ValueTask<List<Process>> GetAuthorizedProcessesAsync(IAuthorizedProcessQuery processQuery);
        ValueTask<List<InternalProcess>> GetAuthorizedInternalProcessesAsync(IAuthorizedInternalProcessQuery processQuery);


        ValueTask<InternalProcess> GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType);
        ValueTask<InternalProcess> GetInternalProcessByProcessIdAsync(Guid processId);
        ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, ProcessVersionType versionType);
        ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processId, string hash, ProcessVersionType versionType);
        ValueTask<Dictionary<Guid, ProcessData>> GetAllProcessDataAsync(Guid processId);

        /// <summary>
        /// Instead of putting this method in ImageRepository, we put it here 
        /// Because we have to use the process concurrency lock logic to do this action
        /// </summary>
        /// <param name="imageReferences"></param>
        /// <returns></returns>
        ValueTask DeleteUnusedImageReferencesAsync(List<ImageReference> imageReferences, Guid opmProcessId);
    }
}
