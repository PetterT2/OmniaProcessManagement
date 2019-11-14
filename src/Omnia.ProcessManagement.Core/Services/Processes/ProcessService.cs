using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Core.Repositories.Processes;
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

        public async ValueTask<Process> CheckInProcess(CheckInProcessModel model)
        {
            var process = await ProcessRepository.CheckInProcessAsync(model);
            return process;
        }

        public async ValueTask<Process> CheckOutProcess(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public ValueTask<ProcessContent> GetMultilingualProcessContent(Guid processContentId)
        {
            throw new NotImplementedException();
        }

        public ValueTask<Process> GetProcess(Guid processId)
        {
            throw new NotImplementedException();
        }
    }
}
