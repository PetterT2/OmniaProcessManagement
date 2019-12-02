using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.HostConfiguration;
using Omnia.Fx.HostConfiguration.Extensions;
using Omnia.Fx.Models.AppSettings;
using Omnia.Fx.NetCore.Worker.Hosting;
using Omnia.ProcessManagement.Core.Extensions;
using System.IO;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
                await new WorkerHost(args)
                    .ConfigureOmnia((omniaConfig, logging) =>
                    {
                        omniaConfig.AddAppSettingsJsonFile("appsettings.json", Directory.GetCurrentDirectory());
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

                        omniaConfig.Configuration((configBuilder) =>
                        {
                            configBuilder.AddCommandLine(args);
                            omniaConfig.ConfigureServices((serviceCollection) =>
                            {
                                var configuration = configBuilder.Build();

                                serviceCollection.AddLogging();
                                serviceCollection.AddAsOption<OmniaAppSettings>(configuration);
                                serviceCollection.AddHostedService<ExampleWorker>();
                            });
                        });
                    })
                    .RunAsync();
        }
    }
}
