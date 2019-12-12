﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Repositories.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Core.Services.Workflows
{
    internal class WorkflowService : IWorkflowService
    {
        IWorkflowRepository WorkflowRepository { get; }

        public WorkflowService(IWorkflowRepository workflowRepository)
        {
            WorkflowRepository = workflowRepository;
        }

        public async ValueTask<Workflow> CreateAsync(Workflow workflow)
        {
            return await WorkflowRepository.CreateAsync(workflow);
        }
    }
}
