using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Users;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.Processes;
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
        IProcessSecurityService ProcessSecurityService { get; }

        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }

        public PublishProcessService(IProcessService processService,
            IApprovalTaskService approvalTaskService,
            IWorkflowService workflowService,
            IProcessSecurityService processSecurityService,
            ITeamCollaborationAppsService teamCollaborationAppsService)
        {
            ProcessService = processService;
            ApprovalTaskService = approvalTaskService;
            WorkflowService = workflowService;
            ProcessSecurityService = processSecurityService;
            TeamCollaborationAppsService = teamCollaborationAppsService;
        }

        public async ValueTask PublishProcessAsync(Guid teamAppId, PublishProcessWithoutApprovalRequest request)
        {
            try
            {
                var securityResourceId = await ProcessSecurityService.AddOrUpdateOPMReaderPermissionAsync(teamAppId, request.OPMProcessId, GetLimitedUsers(request.IsLimitedAccess, request.LimitedUsers));
                var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing, securityResourceId);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask<Process> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var process = await ProcessService.BeforeApprovalProcessAsync(request.OPMProcessId, ProcessWorkingStatus.SendingForApproval);
                return process;
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingApprovalProcessAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var process = await ProcessService.GetProcessByIdAsync(request.ProcessId);
                await ProcessSecurityService.AddOrUpdateOPMApproverPermissionAsync(request.OPMProcessId, request.Approver.Uid);
                await ApprovalTaskService.AddApprovalTaskAndSendEmailAsync(request, process);
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.WaitingForApproval, ProcessVersionType.Draft);
            }
            catch (Exception ex)
            {
                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(request.OPMProcessId);
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingCancelWorkflowAsync(Guid opmProcessId, Guid workflowId, Guid teamAppId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var workflow = await WorkflowService.GetAsync(workflowId);
                var process = await ProcessService.GetProcessByIdAsync(workflow.ProcessId);
                if (process.OPMProcessId != opmProcessId)
                {
                    throw new Exception(""); //TO-DO : what message should we throw here ?!
                }

                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(opmProcessId);
                await ApprovalTaskService.CancelApprovalTaskAndSendEmailAsync(workflow, process, webUrl);
                await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.Draft, ProcessVersionType.Draft);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.FailedCancellingApproval, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(approvalTask.Process.TeamAppId);

                //TODO : Update to be more secure
                //Should NOT based on the value send from the client-side. 
                //i.e. this WorkflowTask could not belongs to the current user
                //i.e. this WorkflowTask could not be a Approval Workflow task
                //===> We should get the data directly from dbs with correct query


                await ApprovalTaskService.CompleteWorkflowAsync(approvalTask, webUrl);
                if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                {
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Publishing, ProcessVersionType.Draft);
                }
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingCompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(approvalTask.Process.TeamAppId);

                //TODO : Update to be more secure
                //Should NOT based on the value send from the client-side. 
                //i.e. the approver could change IsLimitedAccess, LimitedUsers settings => no secure
                //===> We should get the data directly from dbs with correct query


                await ApprovalTaskService.CompletedApprovalTaskAndSendEmail(approvalTask, webUrl);
                if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                {
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Published, ProcessVersionType.Draft);
                    var approvalData = approvalTask.Workflow.WorkflowData.Cast<WorkflowData, WorkflowApprovalData>();
                    var securityResourceId = await ProcessSecurityService.AddOrUpdateOPMReaderPermissionAsync(approvalTask.Process.TeamAppId, approvalTask.Process.OPMProcessId, GetLimitedUsers(approvalData.IsLimitedAccess, approvalData.LimitedUsers));
                    await ProcessService.PublishProcessAsync(approvalTask.Process.OPMProcessId, approvalTask.Workflow.WorkflowData.Comment, approvalData.IsRevisionPublishing, securityResourceId);
                }
                else
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Draft, ProcessVersionType.Draft);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(approvalTask.Process.OPMProcessId);
                throw;
            }
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
