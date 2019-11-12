using Microsoft.AspNetCore.Hosting;
using Omnia.Fx.HostConfiguration.Extensions;
using Omnia.Fx.NetCore.WebApp.Hosting;
using Omnia.ProcessManagement.Core.Extensions;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web
{
    public class Program
    {

        public static async Task Main(string[] args)
        {
            await BuildWebHost(args)
                    .RunOmniaAsync();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return new WebAppHost(args)
                .ConfigureOmnia<Startup>((omniaConfig, logging) =>
                {
                    omniaConfig
                        .AddAppSettingsJsonFile("appsettings.local.json")
                        .AddOmniaFxWebApp()
                        .AddOmniaFxNetCoreSharePoint()
                        .AddOmniaPMCore(); 
                })
                .Build();
        }
    }
}