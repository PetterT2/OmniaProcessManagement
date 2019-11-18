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


        public async ValueTask<Process> CheckInProcessAsync(CheckInProcessModel checkInProcessModel)
        {
            var process = await ProcessRepository.CheckInProcessAsync(checkInProcessModel);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(CreateDraftProcessModel createDraftProcessModel)
        {
            var process = await ProcessRepository.CreateDraftProcessAsync(createDraftProcessModel);
            if (createDraftProcessModel.CheckOut)
            {
                process = await CheckOutProcessAsync(process.OPMProcessId);
            }

            return process;
        }
    }
}
