using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Transaction
{
    internal class TransactionRepositiory : ITransactionRepository
    {
        ProcessWorkingStatus? ProcessWorkingStatus { get; set; }

        OmniaPMDbContext DbContext;
        IMessageBus MessageBus { get; }
        public TransactionRepositiory(OmniaPMDbContext databaseContext, IMessageBus messageBus)
        {
            DbContext = databaseContext;
            MessageBus = messageBus;
        }

        public async ValueTask<T> InitTransactionAsync<T>(Func<ValueTask<T>> action)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {
                var result = await action();
                await transaction.CommitAsync();

                if (ProcessWorkingStatus.HasValue)
                {
                    await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { ProcessWorkingStatus.Value });
                }

                return result;
            }
        }

        public async ValueTask InitTransactionAsync(Func<ValueTask> action)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {

                await action();
                await transaction.CommitAsync();

                if (ProcessWorkingStatus.HasValue)
                {
                    await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { ProcessWorkingStatus.Value });
                }
            }
        }

        public async ValueTask PublishWorkingStatusChangedAsync(ProcessWorkingStatus processWorkingStatus)
        {
            if (DbContext.Database.CurrentTransaction != null)
            {
                ProcessWorkingStatus = processWorkingStatus;
            }
            else {
                await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { processWorkingStatus });
            }
        }
    }
}
