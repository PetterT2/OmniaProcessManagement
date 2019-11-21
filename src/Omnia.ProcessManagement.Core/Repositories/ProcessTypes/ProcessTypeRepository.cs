using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    internal class ProcessTypeRepository : RepositoryBase<Entities.ProcessTypes.ProcessType>, IProcessTypeRepository
    {
        public ProcessTypeRepository(OmniaPMDbContext databaseContext) : base(databaseContext)
        {
        }
    }
}
