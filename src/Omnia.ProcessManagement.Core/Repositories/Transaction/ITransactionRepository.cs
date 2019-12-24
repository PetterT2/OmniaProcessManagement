using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Transaction
{
    /// <summary>
    /// Remember to put all the code changing OPM database as on top as possible in transaction scope
    /// So other external requests like calling Omnia, SharePoint failed will trigger the transaction rollback to keep OPM data safe.
    /// 
    /// Note: This not mean all external requests also will be protected by using this transaction. 
    /// This only use for ensure OPM database as less corrupt as possible.
    /// </summary>
    internal interface ITransactionRepository
    {
        ValueTask<T> InitTransactionAsync<T>(Func<ValueTask<T>> action);
        ValueTask InitTransactionAsync(Func<ValueTask> action);
    }
}
