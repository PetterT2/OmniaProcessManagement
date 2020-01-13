using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Transaction
{
    internal class TransactionRepositiory : ITransactionRepository
    {
        List<ProcessWorkingStatus> ProcessWorkingStatuses { get; set; }

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
                ProcessWorkingStatuses = new List<ProcessWorkingStatus>();

                var result = await action();
                await transaction.CommitAsync();

                if(ProcessWorkingStatuses.Count > 0)
                {
                    await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, ProcessWorkingStatuses.ToList());
                }

                return result;
            }
        }

        public async ValueTask InitTransactionAsync(Func<ValueTask> action)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {
                ProcessWorkingStatuses = new List<ProcessWorkingStatus>();

                await action();
                await transaction.CommitAsync();

                if (ProcessWorkingStatuses.Count > 0)
                {
                    await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, ProcessWorkingStatuses.ToList());
                }
            }
        }

        public async ValueTask PublishWorkingStatusChangedAsync(ProcessWorkingStatus processWorkingStatus)
        {
            if (DbContext.Database.CurrentTransaction != null)
            {
                ProcessWorkingStatuses.Add(processWorkingStatus);
            }
            else {
                await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, new List<ProcessWorkingStatus> { processWorkingStatus });
            }
        }
    }
}
