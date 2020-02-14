using Microsoft.Extensions.Logging;
using Microsoft.SharePoint.Client;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Features;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Services.SharePointEntities;
using Omnia.ProcessManagement.Core.Services.Features.Artifacts;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Features
{
    public class ArchiveProcessFeatureService : IArchiveProcessFeatureService
    {
        private ILogger<ArchiveProcessFeatureService> Logger { get; }
        private ILocalizationProvider LocalizationProvider { get; }
        private ISharePointClientContextProvider SPClientContextProvider { get; }
        private ISharePointEntityProvider SPEntityProvider { get; }
        private ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        public ArchiveProcessFeatureService(ILogger<ArchiveProcessFeatureService> logger,
            ILocalizationProvider localizationProvider,
            ISharePointClientContextProvider spClientContextProvider,
            ISharePointEntityProvider spEntityProvider,
            ITeamCollaborationAppsService teamCollaborationAppsService
        )
        {
            Logger = logger;
            LocalizationProvider = localizationProvider;
            SPClientContextProvider = spClientContextProvider;
            SPEntityProvider = spEntityProvider;
            TeamCollaborationAppsService = teamCollaborationAppsService;
        }

        public async ValueTask ActiveFeatureAsync(string spUrl, FeatureEventArg eventArg)
        {
            await Execute(spUrl, eventArg);
        }

        public async ValueTask UpgradeFeatureAsync(string fromVersion, string spUrl, FeatureEventArg eventArg)
        {
            await Execute(spUrl, eventArg);
        }

        public async ValueTask DeactiveFeatureAsync(string spUrl)
        {

        }

        private async ValueTask Execute(string spUrl, FeatureEventArg eventArg)
        {
            var teamAppId = await TeamCollaborationAppsService.GetTeamAppIdAsync(spUrl);

            PortableClientContext ctx = SPClientContextProvider.CreateClientContext(spUrl, true);
            Site site = ctx.Site;
            Web web = ctx.Web;
            ctx.Load(site, s => s.RootWeb, s => s.Url);
            ctx.Load(web,
                w => w.Navigation.QuickLaunch,
                w => w.Language,
                w => w.Url,
                w => w.ServerRelativeUrl,
                w => w.Title);
            await ctx.ExecuteQueryAsync();
            await EnsureArchiveLibraryAsync(ctx);
        }

        private async ValueTask EnsureArchiveLibraryAsync(PortableClientContext clientContext)
        {
            string contentTypeGroupName = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ContentTypeGroupName, clientContext.Web.Language);
            string fieldGroupName = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.FieldGroupName, clientContext.Web.Language);
            var context = SPEntityProvider.CreateContext(clientContext.Site, clientContext.Web);
            EnsureFields(context, fieldGroupName);
            EnsureContentTypes(context, contentTypeGroupName);
            context.EnsureList<OPMArchived>();
            await context.ExecuteAsync();
            Logger.Log(LogLevel.Information, "Ensured Archived ContentTypes, Library, Fields");
        }

        private void EnsureFields(ISharePointEntityContext context, string fieldGroupName)
        {
            context.EnsureField<OPMProcessId>().Configure((option) => { option.Group = fieldGroupName; });
            context.EnsureField<OPMEdition>().Configure((option) => { option.Group = fieldGroupName; });
            context.EnsureField<OPMRevision>().Configure((option) => { option.Group = fieldGroupName; });
            context.EnsureField<OPMProcessData>().Configure((option) => { option.Group = fieldGroupName; });
            context.EnsureField<OPMComment>().Configure((option) => { option.Group = fieldGroupName; });
            context.EnsureField<OPMTaskOutcome>().Configure((option) => { option.Group = fieldGroupName; });
        }

        private void EnsureContentTypes(ISharePointEntityContext context, string contentTypeGroupName)
        {
            //context.EnsureContentType<OPMApprovalTask>().Configure((option) =>
            //{
            //    option.Group = contentTypeGroupName;
            //});
        }
    }
}
