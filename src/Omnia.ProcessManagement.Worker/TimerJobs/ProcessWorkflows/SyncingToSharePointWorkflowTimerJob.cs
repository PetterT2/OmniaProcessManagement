using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs
{
    internal class SyncingToSharePointWorkflowTimerJob : BaseWorkflowTimerJob
    {
        public SyncingToSharePointWorkflowTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IMessageBus messageBus,
            ILogger<SyncingToSharePointWorkflowTimerJob> logger) : base(appLifetime,
                serviceScopeFactory,
                messageBus,
                logger,
                ProcessWorkingStatus.SyncingToSharePoint,
                DraftOrPublishedVersionType.Published)
        {

        }

        protected override async ValueTask HandleAsync(IServiceScopeFactory serviceScopeFactory, Process process)
        {
            try
            {
                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var processSyncingService = scope.ServiceProvider.GetRequiredService<IProcessSyncingService>();
                    await processSyncingService.SyncToSharePointAsync(process);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Syncing to SharePoint for process with OPMProcessId: {process.OPMProcessId} failed: {ex.Message} - {ex.StackTrace}");

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var processService = scope.ServiceProvider.GetRequiredService<IProcessService>();
                    await processService.UpdatePublishedProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.SyncingToSharePointFailed);
                }
                Logger.LogError($"process with OPMProcessId: {process.OPMProcessId} was updated to working status {ProcessWorkingStatus.SyncingToSharePointFailed.ToString()}");
            }
        }
    }
}
