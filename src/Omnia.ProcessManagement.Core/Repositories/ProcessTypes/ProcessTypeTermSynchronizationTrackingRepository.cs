using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    internal class ProcessTypeTermSynchronizationTrackingRepository : IProcessTypeTermSynchronizationTrackingRepository
    {
        private OmniaPMDbContext DatabaseContext { get; }

        public ProcessTypeTermSynchronizationTrackingRepository(OmniaPMDbContext databaseContext)
        {
            DatabaseContext = databaseContext;
        }
    }
}
