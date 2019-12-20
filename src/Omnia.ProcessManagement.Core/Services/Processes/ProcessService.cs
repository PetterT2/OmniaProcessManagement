﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    internal class ProcessService : IProcessService
    {
        IProcessRepository ProcessRepository { get; }

        public ProcessService(IProcessRepository processRepository)
        {
            ProcessRepository = processRepository;
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

        public async ValueTask DeleteDraftProcessAsync(Guid opmProcessId)
        {
            await ProcessRepository.DeleteDraftProcessAsync(opmProcessId);
        }

        public async ValueTask<List<Process>> GetProcessesAsync(AuthorizedProcessQuery processQuery)
        {
            return await ProcessRepository.GetProcessesAsync(processQuery);
        }

        public async ValueTask<Dictionary<Guid,ProcessWorkingStatus>> GetProcessWorkingStatusAsync(AuthorizedProcessQuery processQuery)
        {
            var internalProcessQuery = processQuery.ConvertToAuthorizedInternalProcessQuery();
            var internalProcesses = await ProcessRepository.GetInternalProcessesAsync(internalProcessQuery);
            List<ProcessWorkingStatus> workingStatus = new List<ProcessWorkingStatus>();

            var workingStatusDict = internalProcesses.ToDictionary(p => p.OPMProcessId, p => p.ProcessWorkingStatus);
            return workingStatusDict;
        }

        public async ValueTask<Process> BeforeApprovalProcessAsync(Guid opmProcessId, ProcessWorkingStatus processWorkingStatus)
        {
            return await ProcessRepository.BeforeApprovalProcessAsync(opmProcessId, processWorkingStatus);
        }

        public async ValueTask<Process> UpdateProcessStatusAsync(Guid opmProcessId, ProcessWorkingStatus processWorkingStatus, ProcessVersionType versionType)
        {
            return await ProcessRepository.UpdateProcessStatusAsync(opmProcessId, processWorkingStatus, versionType);
        }


        public async ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsed(Guid processId, List<Guid> deletingProcessStepIds)
        {
            var beingUsed = await ProcessRepository.CheckIfDeletingProcessStepsAreBeingUsed(processId, deletingProcessStepIds);
            return beingUsed;
        }
    }
}
