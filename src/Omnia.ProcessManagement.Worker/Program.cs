using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.HostConfiguration;
using Omnia.Fx.HostConfiguration.Extensions;
using Omnia.Fx.Models.AppSettings;
using Omnia.Fx.NetCore.Worker.Hosting;
using Omnia.ProcessManagement.Core.Extensions;
using Omnia.ProcessManagement.Worker.TimerJobs;
using System.IO;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker
{
    public class Program
    {

        public static async Task Main(string[] args)
        {
            await CreateHostBuilder(args).Build().RunAsync();
        }

        /// <summary>
        /// Build host here to support add migration
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return new OmniaHostBuilder(args)
                .ConfigureOmniaFx((omniaConfig, logger) => {

                    omniaConfig.AddAppSettingsJsonFile("appsettings.json");
                    omniaConfig.AddAppSettingsJsonFile("appsettings.local.json", Directory.GetCurrentDirectory());

                    omniaConfig.AddOmniaFxNetCore((options) =>
                    {
                        options.AddFeatureHandlers((featureProviderOptions) =>
                        {
                            featureProviderOptions.AddFeatureProvider<Features.ProcessManagement.ProcessManagementHandler>();
                            featureProviderOptions.AddFeatureProvider<Features.ProcessLibrary.ProcessLibraryProvider>();
                        });
                    })
                    .AddOmniaFxNetCoreSharePoint()
                    .AddOmniaPMCore();

                }).ConfigureHost(hostbuilder => {
                    hostbuilder.ConfigureServices(services => {
                        services.AddDistributedMemoryCache();

                        services.AddHostedService<ProcessTypeTermSynchronizationTimerJob>();
                        services.AddHostedService<SendingForApprovalWorkflowTimerJob>();
                        services.AddOmniaPMSqlDB();
                    });
                });
        }
    }
}
