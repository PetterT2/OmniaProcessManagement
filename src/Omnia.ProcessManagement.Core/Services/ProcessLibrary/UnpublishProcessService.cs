using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class UnpublishProcessService : IUnpublishProcessService
    {
        IProcessService ProcessService { get; }
        ITransactionRepository TransactionRepositiory { get; }

        public UnpublishProcessService(ITransactionRepository transactionRepositiory, IProcessService processService)
        {
            ProcessService = processService;
            TransactionRepositiory = transactionRepositiory;
        }

        public async ValueTask UnpublishProcessAsync(Guid opmProcessId)
        {
            await ProcessService.UnpublishProcessAsync(opmProcessId);
        }

        public async ValueTask ProcessArchivingAsync(Process process)
        {

        }
    }
}
