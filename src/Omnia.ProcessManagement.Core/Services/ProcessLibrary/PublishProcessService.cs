using System;
using System.Threading.Tasks;
using Omnia.Fx.Localization;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class PublishProcessService : IPublishProcessService
    {
        IProcessService ProcessService { get; }
        IApprovalTaskService ApprovalTaskService { get; }

        public PublishProcessService(IProcessService processService,
            IApprovalTaskService approvalTaskService)
        {
            ProcessService = processService;
            ApprovalTaskService = approvalTaskService;
        }

        public async ValueTask PublishProcessAsync(PublishProcessWithoutApprovalRequest request)
        {
            var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing);
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
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, Models.Enums.ProcessVersionType.Draft);
                throw ex;
            }
        }

        public async ValueTask ProcessingApprovalProcessAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var process = await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.WaitingForApproval, Models.Enums.ProcessVersionType.Draft);
                await ApprovalTaskService.AddApprovalTaskAndSendEmailAsync(request, process);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, Models.Enums.ProcessVersionType.Draft);
                throw ex;
            }
        }

    }
}
