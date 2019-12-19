using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Omnia.Fx.HostConfiguration.Extensions;
using Omnia.Fx.NetCore.WebApp.Hosting;
using Omnia.ProcessManagement.Core.EnterpriseProperties;
using Omnia.ProcessManagement.Core.Extensions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Omnia.ProcessManagement.Web.Security.ResourceEvaluators;

namespace Omnia.ProcessManagement.Web
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
                    .ConfigureOmniaFx((omniaConfig, logger) =>
                    {
                    omniaConfig
                        .AddAppSettingsJsonFile("appsettings.json")
                        .AddAppSettingsJsonFile("appsettings.local.json")
                        .AddOmniaFxWebApp((options)=> {
                            options.DefaultConfiguration();
                            options.AddEnterprisePropertyFieldProvider(
                                   EnterprisePropertyFieldProviderOptionsHelper.ConfigureEnterprisePropertyFieldProvider);
                        })
                        .AddOmniaFxNetCoreSharePoint()
                        .AddOmniaPMCore(); 
                }).ConfigureHost(hostbuilder =>
                        hostbuilder
                        .ConfigureServices(services => {
                            services.AddRouting();

                            services.AddOmniaPMSqlDB();

                            services.AddScopedWithSingeltonRef<ISecurityResourceIdResourceEvaluator, SecurityResourceIdResourceEvaluator>();
                            services.AddScopedWithSingeltonRef<IOPMProcessIdResourceEvaluator, OPMProcessIdResourceEvaluator>();

                            // Register the Swagger generator, defining one or more Swagger documents
                            services.AddSwaggerGen(c =>
                            {
                                c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
                            });
                        })
                        .ConfigureWebHost(webHostBuilder =>
                        {
                            webHostBuilder.Configure((ctx, app) =>
                            {
                                app.UseStaticFiles();

                                app.UseRouting();

                                // Enable middleware to serve generated Swagger as a JSON endpoint.
                                app.UseSwagger();

                                // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), specifying the Swagger JSON endpoint.
                                app.UseSwaggerUI(c =>
                                {
                                    c.RoutePrefix = "swagger";
                                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Omnia.Workplace.Web V1");
                                });

                                //Middleware

                                app.UseAuthentication();
                                app.UseAuthorization();

                                app.UseEndpoints(endpoints => {
                                    endpoints.MapControllers();
                                });
                            });
                        })
                    );

        }
    }
}