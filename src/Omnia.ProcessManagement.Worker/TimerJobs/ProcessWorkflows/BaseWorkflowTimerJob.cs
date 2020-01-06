using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.DependencyInjection;
using Omnia.Fx.Messaging;
using Omnia.Fx.NetCore.Worker;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs
{
    internal abstract class BaseWorkflowTimerJob : LifetimeEventsHostedService
    {
        private static object _lock = new object();
        private static bool EnsuredSubscribeTriggerProcessWorkflowHandlerJob = false;
        private static Dictionary<ProcessWorkingStatus, DateTimeOffset> _latestTimeUpdateProcessWorkingStatusDict = new Dictionary<ProcessWorkingStatus, DateTimeOffset>
        {
            [ProcessWorkingStatus.SendingForApproval] = DateTimeOffset.UtcNow,
            [ProcessWorkingStatus.SendingForReview] = DateTimeOffset.UtcNow,
            [ProcessWorkingStatus.CancellingApproval] = DateTimeOffset.UtcNow,
            [ProcessWorkingStatus.CancellingReview] = DateTimeOffset.UtcNow,
            [ProcessWorkingStatus.SyncingToSharePoint] = DateTimeOffset.UtcNow,
            [ProcessWorkingStatus.Archiving] = DateTimeOffset.UtcNow
        };

        protected IServiceScopeFactory ServiceScopeFactory { get; }
        protected DraftOrPublishedVersionType VersionType { get; }
        protected ProcessWorkingStatus ProcessWorkingStatus { get; }
        protected ILogger<BaseWorkflowTimerJob> Logger { get; }


        private Timer _timer;
        private int _millisecondsUtilNextRun = 10000;
        private DateTimeOffset _lastTimeRunSync = DateTimeOffset.MinValue;

        public BaseWorkflowTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IMessageBus messageBus,
            ILogger<BaseWorkflowTimerJob> logger,
            ProcessWorkingStatus processWorkingStatus,
            DraftOrPublishedVersionType versionType) : base(appLifetime)
        {
            Logger = logger;
            ServiceScopeFactory = serviceScopeFactory;
            ProcessWorkingStatus = processWorkingStatus;
            VersionType = versionType;
            EnsureSubscribeOnProcessWorkingStatusUpdated(messageBus);
        }

        public override Task OnStarted()
        {
            _timer = new Timer((state) =>
            {
                _ = TimerRun();
            }, null, 0, Timeout.Infinite);

            return Task.CompletedTask;
        }

        public override Task OnStopped()
        {
            return Task.CompletedTask;
        }

        public override Task OnStopping()
        {
            _timer.Dispose();
            return Task.CompletedTask;
        }

        protected abstract ValueTask HandleAsync(IServiceScopeFactory serviceScopeFactory, Models.Processes.Process process);

        private async Task TimerRun()
        {

            try
            {
                var latestTimeRunSync = _latestTimeUpdateProcessWorkingStatusDict[ProcessWorkingStatus];
                if (_lastTimeRunSync < latestTimeRunSync)
                {
                    using (var scope = ServiceScopeFactory.CreateScope())
                    {
                        IProcessService processService = scope.ServiceProvider.GetRequiredService<IProcessService>();
                        var processes = await processService.GetProcessesByWorkingStatusAsync(ProcessWorkingStatus, VersionType);

                        var failed = false;
                        foreach (var process in processes)
                        {

                            try
                            {
                                await HandleAsync(ServiceScopeFactory, process);
                            }
                            catch (Exception ex)
                            {
                                //Inner each HandleAsync implemetation should have its own try/catch. then update the working status to failed if error happen
                                //This catch is only used for ensuring unexpected issue happen, then the _lastTimeRunSync will not be updated to let it retry the process again next time
                                Logger.LogError($"Unexpected exception in handling workflow '{ProcessWorkingStatus.ToString()}' for process with OPMProcessId '{process.OPMProcessId}': {ex.Message} - {ex.StackTrace}");
                                failed = true;
                            }
                        }

                        if (!failed)
                        {
                            _lastTimeRunSync = latestTimeRunSync;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Process workflow TimerJob: {ex.Message}. {ex.StackTrace}");
            }
            finally
            {
                //ready for next run in _millisecondsUtilNextRun;
                _timer.Change(_millisecondsUtilNextRun, Timeout.Infinite);
            }
        }

        private static void EnsureSubscribeOnProcessWorkingStatusUpdated(IMessageBus messageBus)
        {
            if (EnsuredSubscribeTriggerProcessWorkflowHandlerJob == false)
            {
                lock (_lock)
                {
                    if (EnsuredSubscribeTriggerProcessWorkflowHandlerJob == false)
                    {
                        EnsuredSubscribeTriggerProcessWorkflowHandlerJob = true;

                        messageBus.SubscribeAsync(OPMConstants.Messaging.Topics.OnProcessWorkingStatusUpdated, async (processWorkingStatuses) =>
                        {
                            foreach (var processWorkingStatus in processWorkingStatuses)
                            {
                                _latestTimeUpdateProcessWorkingStatusDict[processWorkingStatus] = DateTimeOffset.UtcNow;
                            }

                            await Task.CompletedTask;
                        });
                    }
                }
            }
        }
    }
}
