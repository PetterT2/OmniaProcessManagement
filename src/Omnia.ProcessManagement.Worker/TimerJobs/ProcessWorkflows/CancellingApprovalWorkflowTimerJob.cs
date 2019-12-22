using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs
{
    internal class CancellingApprovalWorkflowTimerJob : BaseWorkflowTimerJob
    {
        public CancellingApprovalWorkflowTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IMessageBus messageBus,
            ILogger<SendingForApprovalWorkflowTimerJob> logger) : base(appLifetime,
                serviceScopeFactory,
                messageBus,
                logger,
                ProcessWorkingStatus.CancellingApproval,
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
                    await publishProcessService.ProcessCancellingApprovalAsync(process);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Cancelling approval for process with OPMProcessId: {process.OPMProcessId} failed: {ex.Message} - {ex.StackTrace}");

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var publishProcessService = scope.ServiceProvider.GetRequiredService<IPublishProcessService>();
                    await publishProcessService.UpdateCancellingApprovalFailedAsync(process);
                }
                Logger.LogError($"process with OPMProcessId: {process.OPMProcessId} was updated to working status {ProcessWorkingStatus.CancellingApprovalFailed.ToString()}");
            }
        }
    }
}
