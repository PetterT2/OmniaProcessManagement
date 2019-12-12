using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    public interface IWorkflowRepository
    {
        ValueTask AddWorkflowAsync(Workflow workflow);
    }
}
