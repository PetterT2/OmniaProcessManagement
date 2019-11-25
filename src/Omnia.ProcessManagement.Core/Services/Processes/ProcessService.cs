using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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

        public async ValueTask<Process> CheckInProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.CheckInProcessAsync(actionModel);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.CreateDraftProcessAsync(actionModel);
            process = await CheckOutProcessAsync(process.OPMProcessId);
            return process;
        }

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.PublishProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid processStepId, ProcessVersionType vertionType, string hash)
        {
            var processData = await ProcessRepository.GetProcessDataAsync(processStepId, vertionType, hash);
            return processData;
        }

        public async ValueTask<List<Process>> GetProcessesDataAsync(Guid siteId, Guid webId)
        {
            return await ProcessRepository.GetProcessesDataAsync(siteId, webId);
        }
    }
}
