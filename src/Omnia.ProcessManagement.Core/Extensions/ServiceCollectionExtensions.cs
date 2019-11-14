using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Omnia.ProcessManagement.Core.Repositories;
using Omnia.ProcessManagement.Core.Repositories.ProcessTemplates;
using Omnia.ProcessManagement.Core.Services.ProcessTemplates;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Extensions
{
    public static class IServiceCollectionExtensions
    {
        internal static IServiceCollection AddOmniaCoreOptionSettings(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }

        internal static IServiceCollection AddOmniaPMComponents(this IServiceCollection services)
        {
            //We should agree on the naming convention : Reposiroty is for our database layer, NOT Sharepoint

            //Services
            services.AddScopedWithSingeltonRef<IProcessTemplateService, ProcessTemplateService>();

            //Repositories
            services.AddScopedWithSingeltonRef<IProcessTemplateRepository, ProcessTemplateRepository>();

            services.AddAutoMapper();
            return services;
        }

        public static IServiceCollection AddOmniaPMSqlDB(this IServiceCollection services)
        {
            services.AddOmniaSqlDBContext<OmniaPMDbContext>(OPMConstants.RequestedOmniaResources.SqlDBUniqueId,
                (sqlInfo, serviceProvider, optionsBuilder) =>
                {
                    optionsBuilder.UseSqlServer(sqlInfo.ConnectionString)
                    .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
                });

            return services;
        }
    }
}
