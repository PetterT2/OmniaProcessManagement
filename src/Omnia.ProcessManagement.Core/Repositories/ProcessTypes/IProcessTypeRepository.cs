using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    public interface IProcessTypeRepository
    {
        ValueTask<IList<ProcessType>> GetByIdAsync(List<Guid> ids);
        ValueTask<IList<ProcessType>> GetChildrenAsync(Guid? parentId);
        ValueTask<IList<ProcessType>> GetAllProcessTypeItemsAsync();
        ValueTask<ProcessType> CreateAsync(ProcessType processType);
        ValueTask<(ProcessType, ProcessType)> UpdateAsync(ProcessType processType);
        ValueTask<ProcessType> RemoveAsync(Guid id);
        ValueTask<IDictionary<Guid, int>> GetChildCountAsync(IList<Guid> ids);
        ValueTask SyncFromSharePointAsync(List<ProcessType> processTypes);
    }
}
