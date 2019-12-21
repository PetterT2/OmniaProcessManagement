using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.NetCore.Worker;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs
{
    internal class SendingForApprovalWorkflowTimerJob : BaseWorkflowTimerJob
    {
        public SendingForApprovalWorkflowTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IMessageBus messageBus,
            ILogger<SendingForApprovalWorkflowTimerJob> logger) : base(appLifetime,
                serviceScopeFactory,
                messageBus,
                logger,
                ProcessWorkingStatus.SendingForApproval,
                DraftOrLatestPublishedVersionType.Draft)
        {

        }

        protected override async ValueTask HandleAsync(IServiceScopeFactory serviceScopeFactory, Process process)
        {
            try
            {
                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var publishProcessService = scope.ServiceProvider.GetRequiredService<IPublishProcessService>();
                    await publishProcessService.ProcessSendingForApprovalAsync(process);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Sending process for Approval with OPMProcessId: {process.OPMProcessId} failed: {ex.Message} - {ex.StackTrace}");

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var publishProcessService = scope.ServiceProvider.GetRequiredService<IPublishProcessService>();
                    await publishProcessService.UpdateSendingForApprovalFailedAsync(process);
                }
                Logger.LogError($"process with OPMProcessId: {process.OPMProcessId} was updated to working status {ProcessWorkingStatus.SendingForApprovalFailed.ToString()}");
            }
        }
    }
}
