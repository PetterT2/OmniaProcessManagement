using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowRepository : RepositoryBase<Entities.Workflows.Workflow>, IWorkflowRepository
    {
        public WorkflowRepository(OmniaPMDbContext databaseContext) : base(databaseContext) { }

        public async ValueTask AddWorkflowAsync(Models.Workflows.Workflow workflow)
        {
        }
    }
}
