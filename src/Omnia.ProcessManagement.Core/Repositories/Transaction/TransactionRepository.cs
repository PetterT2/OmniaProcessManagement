using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Transaction
{
    internal class TransactionRepositiory : ITransactionRepository
    {
        OmniaPMDbContext DbContext;
        public TransactionRepositiory(OmniaPMDbContext databaseContext)
        {
            DbContext = databaseContext;
        }

        public async ValueTask<T> InitTransactionAsync<T>(Func<ValueTask<T>> action)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {
                var result = await action();
                await transaction.CommitAsync();
                return result;
            }
        }

        public async ValueTask InitTransactionAsync(Func<ValueTask> action)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {
                try
                {
                    await action();
                    await transaction.CommitAsync();
                }
                catch(Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
    }
}
