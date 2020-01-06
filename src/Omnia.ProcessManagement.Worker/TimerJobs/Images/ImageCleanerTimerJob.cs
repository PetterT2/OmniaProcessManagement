using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.NetCore.Worker;
using Omnia.ProcessManagement.Core.Services.Images;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs.Images
{
    internal class ImageCleanerTimerJob : LifetimeEventsHostedService
    {

        private Timer _timer;
        private int _millisecondsUtilNextRun = 24 * 60 * 60 * 1000; //once a day
        protected IServiceScopeFactory ServiceScopeFactory { get; }
        protected ILogger<ImageCleanerTimerJob> Logger { get; }

        public ImageCleanerTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            ILogger<ImageCleanerTimerJob> logger) : base(appLifetime)
        {
            Logger = logger;
            ServiceScopeFactory = serviceScopeFactory;
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

        private async Task TimerRun()
        {

            try
            {
                using (var scope = ServiceScopeFactory.CreateScope())
                {
                    var imageService = scope.ServiceProvider.GetRequiredService<IImageService>();
                    await imageService.EnsureDeleteUnusedImageAsync();
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"ImageCleanerTimerJob: {ex.Message}. {ex.StackTrace}");
            }
            finally
            {
                //ready for next run in _millisecondsUtilNextRun;
                _timer.Change(_millisecondsUtilNextRun, Timeout.Infinite);
            }
        }

    }
}
