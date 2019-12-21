using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Transaction
{
    internal interface ITransactionRepository
    {
        ValueTask<T> InitTransactionAsync<T>(Func<ValueTask<T>> action);
        ValueTask InitTransactionAsync(Func<ValueTask> action);
    }
}
