using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Omnia.ProcessManagement.Core.Repositories;
using Omnia.ProcessManagement.Core.Repositories.Images;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Repositories.ProcessTemplates;
using Omnia.ProcessManagement.Core.Repositories.ProcessTypes;
using Omnia.ProcessManagement.Core.Repositories.Settings;
using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Repositories.Workflows;
using Omnia.ProcessManagement.Core.Services.Features;
using Omnia.ProcessManagement.Core.Services.Graph;
using Omnia.ProcessManagement.Core.Services.Images;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessHandler;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.ProcessRollup;
using Omnia.ProcessManagement.Core.Services.ProcessTemplates;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Core.Services.Workflows;
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
            services.AddScopedWithSingeltonRef<IProcessLibraryFeatureService, ProcessLibraryFeatureService>();
            services.AddScopedWithSingeltonRef<IArchiveProcessFeatureService, ArchiveProcessFeatureService>();

            services.AddScopedWithSingeltonRef<IProcessTemplateService, ProcessTemplateService>();
            services.AddScopedWithSingeltonRef<IProcessService, ProcessService>();
            services.AddScopedWithSingeltonRef<IUnpublishProcessService, UnpublishProcessService>();
            services.AddScopedWithSingeltonRef<ISharePointSiteService, SharePointSiteService>();
            services.AddScopedWithSingeltonRef<IProcessSecurityService, ProcessSecurityService>();
            services.AddScopedWithSingeltonRef<IProcessTypeService, ProcessTypeService>();
            services.AddScopedWithSingeltonRef<IProcessTypeTermSynchronizationTrackingService, ProcessTypeTermSynchronizationTrackingService>();
            services.AddScopedWithSingeltonRef<ISettingsService, SettingsService>();
            services.AddScopedWithSingeltonRef<IPublishProcessService, PublishProcessService>();
            services.AddScopedWithSingeltonRef<IWorkflowService, WorkflowService>();
            services.AddScopedWithSingeltonRef<IWorkflowTaskService, WorkflowTaskService>();
            services.AddScopedWithSingeltonRef<ProcessTypeValidation, ProcessTypeValidation>();
            services.AddScopedWithSingeltonRef<IApprovalTaskService, ApprovalTaskService>();
            services.AddScopedWithSingeltonRef<ISharePointListService, SharePointListService>();
            services.AddScopedWithSingeltonRef<ITeamCollaborationAppsService, TeamCollaborationAppsService>();
            services.AddScopedWithSingeltonRef<ISharePointGroupService, SharePointGroupService>();
            services.AddScopedWithSingeltonRef<ISharePointPermissionService, SharePointPermissionService>();
            services.AddScopedWithSingeltonRef<IProcessSyncingService, ProcessSyncingService>();
            services.AddScopedWithSingeltonRef<ISharePointTaskService, SharePointTaskService>();
            services.AddScopedWithSingeltonRef<IGraphService, GraphService>();
            services.AddScopedWithSingeltonRef<IImageService, ImageService>();
            services.AddScopedWithSingeltonRef<IProcessRollupService, ProcessRollupService>();
            services.AddScopedWithSingeltonRef<IProcessHandleService, ProcessHandleService>();

            //Repositories
            services.AddScopedWithSingeltonRef<ITransactionRepository, TransactionRepositiory>();
            services.AddScopedWithSingeltonRef<IProcessTemplateRepository, ProcessTemplateRepository>();
            services.AddScopedWithSingeltonRef<IProcessRepository, ProcessRepository>();
            services.AddScopedWithSingeltonRef<IProcessTypeRepository, ProcessTypeRepository>();
            services.AddScopedWithSingeltonRef<IProcessTypeTermSynchronizationTrackingRepository, ProcessTypeTermSynchronizationTrackingRepository>();
            services.AddScopedWithSingeltonRef<ISettingsRepository, SettingsRepository>();
            services.AddScopedWithSingeltonRef<IWorkflowRepository, WorkflowRepository>();
            services.AddScopedWithSingeltonRef<IWorkflowTaskRepository, WorkflowTaskRepository>();
            services.AddScopedWithSingeltonRef<IImageRepository, ImageRepository>();

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
