using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    internal class ProcessService : IProcessService
    {
        IProcessRepository ProcessRepository { get; }
        IMessageBus MessageBus { get; }

        public ProcessService(IProcessRepository processRepository, IMessageBus messageBus)
        {
            ProcessRepository = processRepository;
            MessageBus = messageBus;
        }

        public async ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.SaveCheckedOutProcessAsync(actionModel);
            return process;
        }

        public async ValueTask<Process> CheckInProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckInProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.DiscardChangeProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.CreateDraftProcessAsync(actionModel);
            process = await CheckOutProcessAsync(process.OPMProcessId);
            return process;
        }

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId)
        {
            var process = await ProcessRepository.PublishProcessAsync(opmProcessId, comment, isRevision, securityResourceId);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { ProcessWorkingStatus.SyncingToSharePoint });
            return process;
        }

        public async ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            var processData = await ProcessRepository.GetProcessDataAsync(processStepId, hash, versionType);
            return processData;
        }

        public async ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType)
        {
            var processData = await ProcessRepository.GetProcessByProcessStepIdAsync(processStepId, versionType);
            return processData;

        }

        public async ValueTask<Process> GetProcessByIdAsync(Guid processId)
        {
            var process = await ProcessRepository.GetProcessByIdAsync(processId);
            return process;
        }

        public async ValueTask<Process> GetProcessByOPMProcessIdAsync(Guid opmProcessId, DraftOrLatestPublishedVersionType versionType)
        {
            var process = await ProcessRepository.GetProcessByOPMProcessIdAsync(opmProcessId, versionType);
            return process;
        }

        public async ValueTask DeleteDraftProcessAsync(Guid opmProcessId)
        {
            await ProcessRepository.DeleteDraftProcessAsync(opmProcessId);
        }

        public async ValueTask<List<Process>> GetAuthorizedProcessesAsync(AuthorizedProcessQuery processQuery)
        {
            return await ProcessRepository.GetAuthorizedProcessesAsync(processQuery);
        }

        public async ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrLatestPublishedVersionType vesionType)
        {
            return await ProcessRepository.GetProcessesByWorkingStatusAsync(processWorkingStatus, vesionType);
        }

        public async ValueTask<Dictionary<Guid, ProcessWorkingStatus>> GetProcessWorkingStatusAsync(AuthorizedProcessQuery processQuery)
        {
            var internalProcessQuery = processQuery.ConvertToAuthorizedInternalProcessQuery();
            var internalProcesses = await ProcessRepository.GetInternalProcessesAsync(internalProcessQuery);
            List<ProcessWorkingStatus> workingStatus = new List<ProcessWorkingStatus>();

            var workingStatusDict = internalProcesses.ToDictionary(p => p.OPMProcessId, p => p.ProcessWorkingStatus);
            return workingStatusDict;
        }

        public async ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion)
        {
            await ProcessRepository.UpdateDraftProcessWorkingStatusAsync(opmProcessId, newProcessWorkingStatus, allowEixstingCheckedOutVersion);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { newProcessWorkingStatus });
        }

        public async ValueTask UpdateLatestPublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus)
        {
           await ProcessRepository.UpdateLatestPublishedProcessWorkingStatusAsync(opmProcessId, newProcessWorkingStatus);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { newProcessWorkingStatus });
        }

        public async ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds)
        {
            var beingUsed = await ProcessRepository.CheckIfDeletingProcessStepsAreBeingUsedAsync(processId, deletingProcessStepIds);
            return beingUsed;
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType)
        {
            return await ProcessRepository.GetInternalProcessByOPMProcessIdAsync(opmProcessId, versionType);
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByProcessIdAsync(Guid processId)
        {
            return await ProcessRepository.GetInternalProcessByProcessIdAsync(processId);
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByProcessStepIdAsync(Guid processId, ProcessVersionType versionType)
        {
            return await ProcessRepository.GetInternalProcessByProcessStepIdAsync(processId, versionType);
        }
        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByProcessStepIdAsync(Guid processId, string hash, ProcessVersionType versionType)
        {
            return await ProcessRepository.GetInternalProcessByProcessStepIdAsync(processId, hash, versionType);
        }
    }
}
