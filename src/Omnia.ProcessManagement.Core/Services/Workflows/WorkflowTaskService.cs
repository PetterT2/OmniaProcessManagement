using Omnia.ProcessManagement.Core.Repositories.Workflows;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Workflows
{
    internal class WorkflowTaskService : IWorkflowTaskService
    {
        ISharePointTaskService SharePointTaskService { get; }
        IWorkflowTaskRepository WorkflowTaskRepository { get; }
        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        public WorkflowTaskService(IWorkflowTaskRepository workflowTaskRepository, ISharePointTaskService sharePointTaskService,
            ITeamCollaborationAppsService teamCollaborationAppsService)
        {
            SharePointTaskService = sharePointTaskService;
            WorkflowTaskRepository = workflowTaskRepository;
            TeamCollaborationAppsService = teamCollaborationAppsService;
        }

        public async ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId, Guid teamAppId)
        {
            return await WorkflowTaskRepository.CreateAsync(workflowId, assignedUser, spItemId, teamAppId);
        }

        public async ValueTask<WorkflowTask> GetAsync(int spItemId, Guid teamAppId, bool ensurePermissionByGettingSharePointTask)
        {
            var workflowTask = await WorkflowTaskRepository.GetAsync(spItemId, teamAppId);
            
            if (ensurePermissionByGettingSharePointTask)
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var sharePointTask = await SharePointTaskService.GetTaskByIdAsync(webUrl, spItemId);

                workflowTask.SharePointTask = sharePointTask;
            }

            return workflowTask;
        }

        public async ValueTask CompletedAsync(Guid id, string comment, TaskOutcome taskOutCome)
        {
            await WorkflowTaskRepository.SetCompletedTask(id, comment, taskOutCome);
        }
    }
}
