using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Omnia.Fx.Contexts;
using Omnia.Fx.Localization;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Users;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers;
using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ReviewReminders;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class PublishProcessService : IPublishProcessService
    {
        IProcessService ProcessService { get; }
        IApprovalTaskService ApprovalTaskService { get; }
        IWorkflowService WorkflowService { get; }
        IWorkflowTaskService WorkflowTaskService { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        IReviewReminderService ReviewReminderService { get; }
        ITransactionRepository TransactionRepositiory { get; }
        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }

        public PublishProcessService(IProcessService processService,
            IApprovalTaskService approvalTaskService,
            IWorkflowService workflowService,
            IWorkflowTaskService workflowTaskService,
            IProcessSecurityService processSecurityService,
            ITransactionRepository transactionRepositiory,
            ITeamCollaborationAppsService teamCollaborationAppsService,
            IReviewReminderService reviewReminderService)
        {
            ProcessService = processService;
            ApprovalTaskService = approvalTaskService;
            WorkflowService = workflowService;
            WorkflowTaskService = workflowTaskService;
            ProcessSecurityService = processSecurityService;
            TransactionRepositiory = transactionRepositiory;
            TeamCollaborationAppsService = teamCollaborationAppsService;
            ReviewReminderService = reviewReminderService;
        }

        public async ValueTask PublishProcessAsync(Guid teamAppId, PublishProcessWithoutApprovalRequest request)
        {
            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                var securityResourceId = SecurityResourceIdResourceHelper.GetSecurityResourceIdForReader(teamAppId, request.OPMProcessId, request.IsLimitedAccess);

                var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing, securityResourceId, ReviewReminderService);

                await ProcessSecurityService.AddOrUpdateOPMReaderPermissionAsync(teamAppId, request.OPMProcessId, GetLimitedUsers(request.IsLimitedAccess, request.LimitedUsers));
            });
        }

        public async ValueTask PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                await ProcessService.UpdateDraftProcessWorkingStatusAsync(request.OPMProcessId, ProcessWorkingStatus.SendingForApproval, false);
                await ApprovalTaskService.AddWorkflowAsync(request);
            });
        }

        public async ValueTask ProcessSendingForApprovalAsync(Process process)
        {
            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);
                var workflow = await WorkflowService.GetByProcessAsync(process.OPMProcessId, WorkflowType.Approval);
                var workflowApprovalData = workflow.WorkflowData.CastTo<WorkflowData, WorkflowApprovalData>();
                await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.SentForApproval, false);

                var spTaskItemId = await ApprovalTaskService.AddSharePointTaskAndSendEmailAsync(workflow, workflowApprovalData, process, webUrl);

                await WorkflowTaskService.CreateAsync(workflow.Id, workflowApprovalData.Approver.Uid, spTaskItemId, process.TeamAppId);
                await ProcessSecurityService.AddOrUpdateOPMApproverPermissionAsync(process.OPMProcessId, workflowApprovalData.Approver.Uid);
            });
        }

        public async ValueTask UpdateSendingForApprovalFailedAsync(Process process)
        {
            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                var workflow = await WorkflowService.GetByProcessAsync(process.OPMProcessId, WorkflowType.Approval);
                await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.SendingForApprovalFailed, false);
                if (workflow != null)
                {
                    await WorkflowService.CompleteAsync(workflow.Id, WorkflowCompletedType.Cancelled);
                }

                //TODO Ensure remove task form sharepoint if exisit
            });
        }


        public async ValueTask CancelWorkflowAsync(Guid opmProcessId)
        {
            await ProcessService.UpdateDraftProcessWorkingStatusAsync(opmProcessId, ProcessWorkingStatus.CancellingApproval, false);
        }

        public async ValueTask ProcessCancellingApprovalAsync(Process process)
        {
            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);
                var workflow = await WorkflowService.GetByProcessAsync(process.OPMProcessId, WorkflowType.Approval);

                await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.None, false);

                if (workflow.CompletedType == WorkflowCompletedType.None)
                {
                    await WorkflowService.CompleteAsync(workflow.Id, WorkflowCompletedType.Cancelled);
                    await ApprovalTaskService.CancelSharePointTaskAndSendEmailAsync(workflow, process, webUrl);
                }

                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(process.OPMProcessId);
            });
        }

        public async ValueTask UpdateCancellingApprovalFailedAsync(Process process)
        {
            await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.CancellingApprovalFailed, false);
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowTask approvalTask, Process process)
        {
            var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);

            await TransactionRepositiory.InitTransactionAsync(async () =>
            {
                var approvalData = approvalTask.Workflow.WorkflowData.CastTo<WorkflowData, WorkflowApprovalData>();
                var securityResourceId = SecurityResourceIdResourceHelper.GetSecurityResourceIdForReader(process.TeamAppId, process.OPMProcessId, approvalData.IsLimitedAccess);

                await WorkflowService.CompleteAsync(approvalTask.Workflow.Id, WorkflowCompletedType.AllTasksDone);
                await WorkflowTaskService.CompletedAsync(approvalTask.Id, approvalTask.Comment, approvalTask.TaskOutcome);

                if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                {
                    await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.None, false);
                    
                    var publishedProcess = await ProcessService.PublishProcessAsync(process.OPMProcessId, 
                        approvalTask.Workflow.WorkflowData.Comment, 
                        approvalData.IsRevisionPublishing, 
                        securityResourceId,
                        ReviewReminderService);
                }
                else
                {
                    await ProcessService.UpdateDraftProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.None, false);
                }

                await ApprovalTaskService.CompleteSharePointTaskAsync(approvalTask, process, webUrl);
                await ProcessSecurityService.AddOrUpdateOPMReaderPermissionAsync(process.TeamAppId, process.OPMProcessId, GetLimitedUsers(approvalData.IsLimitedAccess, approvalData.LimitedUsers));
            });

            await ApprovalTaskService.SendCompletedEmailAsync(approvalTask, process, webUrl);
        }

        private List<UserIdentity> GetLimitedUsers(bool isLimitedAccess, List<UserIdentity> limitedUsers)
        {
            if (isLimitedAccess)
            {
                if (limitedUsers != null) return limitedUsers;
                return new List<UserIdentity>();
            }
            return null;
        }
    }
}
