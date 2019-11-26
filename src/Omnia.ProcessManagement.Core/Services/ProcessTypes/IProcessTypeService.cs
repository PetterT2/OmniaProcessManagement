using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes
{
    public interface IProcessTypeService
    {
        ValueTask<Guid> GetProcessTypeTermSetIdAsync();
        ValueTask<IList<ProcessType>> GetByIdsAsync(params Guid[] ids);
        ValueTask<IList<ProcessType>> GetChildrenAsync(Guid rootId);
        ValueTask<ProcessType> CreateAsync(ProcessType processType);
        ValueTask<ProcessType> UpdateAsync(ProcessType processType);
        ValueTask RemoveAsync(Guid id);
        ValueTask SyncFromSharePointAsync(List<ProcessType> processTypes);
        void RefreshCache();
    }
}
