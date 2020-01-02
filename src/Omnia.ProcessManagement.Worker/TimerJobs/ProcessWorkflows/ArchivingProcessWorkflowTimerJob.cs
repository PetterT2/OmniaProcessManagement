﻿using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Messaging;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs.ProcessWorkflows
{
    internal class ArchivingProcessWorkflowTimerJob : BaseWorkflowTimerJob
    {
        public ArchivingProcessWorkflowTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IMessageBus messageBus,
            ILogger<ArchivingProcessWorkflowTimerJob> logger) : base(appLifetime,
                serviceScopeFactory,
                messageBus,
                logger,
                ProcessWorkingStatus.Archiving,
                DraftOrPublishedVersionType.Published)
        {

        }

        protected override async ValueTask HandleAsync(IServiceScopeFactory serviceScopeFactory, Process process)
        {
            try
            {
                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var unpublishProcessService = scope.ServiceProvider.GetRequiredService<IUnpublishProcessService>();
                    await unpublishProcessService.ProcessUnpublishingAsync(process);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Archiving process with OPMProcessId: {process.OPMProcessId} failed: {ex.Message} - {ex.StackTrace}");

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var processService = scope.ServiceProvider.GetRequiredService<IProcessService>();
                    await processService.UpdatePublishedProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.ArchivingFailed);
                }
                Logger.LogError($"process with OPMProcessId: {process.OPMProcessId} was updated to working status {ProcessWorkingStatus.ArchivingFailed.ToString()}");
            }
        }
    }
}
