using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.SharePoint.Client;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Features;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Services.SharePointEntities;
using Omnia.ProcessManagement.Core.Services.Features.Artifacts;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Settings;

namespace Omnia.ProcessManagement.Core.Services.Features
{
    public class ProcessLibraryFeatureService : IProcessLibraryFeatureService
    {
        private ILogger<ProcessLibraryFeatureService> Logger { get; }
        private ILocalizationProvider LocalizationProvider { get; }
        private ISharePointClientContextProvider SPClientContextProvider { get; }
        private ISharePointEntityProvider SPEntityProvider { get; }
        private ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        private ISettingsService SettingsService { get; }
        private ISharePointGroupService SPGroupService { get; }
        public ProcessLibraryFeatureService(ILogger<ProcessLibraryFeatureService> logger,
            ILocalizationProvider localizationProvider,
            ISharePointClientContextProvider spClientContextProvider,
            ISharePointEntityProvider spEntityProvider,
            ISettingsService settingsService,
            ITeamCollaborationAppsService teamCollaborationAppsService,
            ISharePointGroupService spGroupService
        )
        {
            Logger = logger;
            LocalizationProvider = localizationProvider;
            SPClientContextProvider = spClientContextProvider;
            SPEntityProvider = spEntityProvider;
            SettingsService = settingsService;
            SPGroupService = spGroupService;
            TeamCollaborationAppsService = teamCollaborationAppsService;
        }

        public async ValueTask ActiveFeatureAsync(string spUrl, FeatureEventArg eventArg)
        {
            await ExecuteAsync(spUrl, eventArg);
        }

        public async ValueTask DeactiveFeatureAsync(string spUrl)
        {
        }

        public async ValueTask UpgradeFeatureAsync(string fromVersion, string spUrl, FeatureEventArg eventArg)
        {
            await ExecuteAsync(spUrl, eventArg);
        }

        private async ValueTask ExecuteAsync(string spUrl, FeatureEventArg eventArg)
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

            var (authorGroup, readerGroup) = await EnsureSharePointGroupsAsync(ctx, teamAppId);
            await EnsureListsAsync(ctx);

            await EnsureUniquePermissionOnListAsync(ctx, web.ServerRelativeUrl + "/" + OPMConstants.SharePoint.ListUrl.PublishList,
                new List<Group> { authorGroup, readerGroup },
                new List<RoleType> { RoleType.Reader });

            await EnsureUniquePermissionOnListAsync(ctx, web.ServerRelativeUrl + "/" + OPMConstants.SharePoint.ListUrl.TaskList, null, null);

            await EnsurePageAsync(ctx, web, readerGroup);
            await ConfigQuickLaunch(ctx, web);
        }

        private async ValueTask<(Group, Group)> EnsureSharePointGroupsAsync(PortableClientContext ctx, Guid teamAppId)
        {
            Principal owner = null;// ctx.Web.AssociatedOwnerGroup; ;

            var settings = await SettingsService.GetAsync<SiteGroupIdSettings>(teamAppId.ToString());
            if (settings == null)
            {
                settings = new SiteGroupIdSettings(teamAppId.ToString());
            }
            Group authorGroup = null;
            Group readerGroup = null;
            bool settingsChanged = true;

            if (settings.AuthorGroupId > 0)
            {
                authorGroup = await SPGroupService.TryGetGroupByIdAsync(ctx, ctx.Site.RootWeb, settings.AuthorGroupId);
            }

            if (settings.DefaultReaderGroupId > 0)
            {
                readerGroup = await SPGroupService.TryGetGroupByIdAsync(ctx, ctx.Site.RootWeb, settings.DefaultReaderGroupId);
            }

            if (authorGroup == null)
            {
                string opmAuthorGroupName = await GetGroupNameAsync(OPMConstants.LocalizedTextKeys.AuthorsGroupSuffix, ctx.Web.Title, ctx.Web.Language);
                authorGroup = await SPGroupService.EnsureGroupOnWebAsync(ctx, ctx.Site.RootWeb, opmAuthorGroupName, new List<RoleDefinition> { ctx.Site.RootWeb.RoleDefinitions.GetByType(RoleType.Reader) }, owner);

                settings.AuthorGroupId = authorGroup.Id;
                settingsChanged = true;
            }

            if (readerGroup == null)
            {
                string opmReaderGroupName = await GetGroupNameAsync(OPMConstants.LocalizedTextKeys.ReadersGroupSuffix, ctx.Web.Title, ctx.Web.Language);
                readerGroup = await SPGroupService.EnsureGroupOnWebAsync(ctx, ctx.Site.RootWeb, opmReaderGroupName, new List<RoleDefinition>(), owner);

                settings.DefaultReaderGroupId = readerGroup.Id;
                settingsChanged = true;
            }

            if (settingsChanged)
            {
                await SettingsService.AddOrUpdateAsync(settings);
            }

            return (authorGroup, readerGroup);
        }

        private async ValueTask<string> GetGroupNameAsync(string localizedText, string webTitle, uint webLanguage)
        {
            var suffix = await LocalizationProvider.GetLocalizedValueAsync(localizedText, webLanguage);
            return webTitle + " " + suffix;
        }

        private async ValueTask EnsureListsAsync(PortableClientContext clientContext)
        {
            string contentTypeGroupName = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ContentTypeGroupName, clientContext.Web.Language);
            string fieldGroupName = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.FieldGroupName, clientContext.Web.Language);
            var context = SPEntityProvider.CreateContext(clientContext.Site, clientContext.Web);
            EnsureFields(context, fieldGroupName);
            EnsureContentTypes(context, contentTypeGroupName);
            context.EnsureList<OPMPublished>();
            context.EnsureList<OPMTasks>();
            await context.ExecuteAsync();
            Logger.Log(LogLevel.Information, "Ensured ContentTypes, Lists, Fields");

        }

        private async ValueTask EnsureUniquePermissionOnListAsync(PortableClientContext ctx, string listUrl, List<Group> groups, List<RoleType> roles)
        {
            List list = ctx.Web.GetList(listUrl);
            ctx.Load(list, l => l.HasUniqueRoleAssignments);
            await ctx.ExecuteQueryAsync();

            if (!list.HasUniqueRoleAssignments)
            {
                list.BreakRoleInheritance(false, false);
            }

            if (groups != null && roles != null && groups.Any() && roles.Any())
            {
                foreach (var group in groups)
                {
                    foreach (var role in roles)
                    {
                        list.RoleAssignments.Add(group, new RoleDefinitionBindingCollection(ctx) { ctx.Web.RoleDefinitions.GetByType(role) });
                    }
                }
                await ctx.ExecuteQueryAsync();
            }
        }

        private void EnsureContentTypes(ISharePointEntityContext context, string contentTypeGroupName)
        {
            context.EnsureContentType<OPMApprovalTask>().Configure((option) =>
            {
                option.Group = contentTypeGroupName;
            });
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


        private async ValueTask ConfigQuickLaunch(PortableClientContext clientContext, Web web)
        {
            try
            {
                var isUpdate = false;
                var quickLaunchList = web.Navigation.QuickLaunch;
                string title = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ProcessLibraryQuickLauchName, web.Language);
                var currentNode = quickLaunchList
                    .Where(q => q.Url.ToLower().EndsWith(OPMConstants.OPMPages.ProcessLibraryPageName.ToLower()))
                    .FirstOrDefault();
                if (currentNode == null)
                {
                    var nodeCreation = new NavigationNodeCreationInformation()
                    {
                        Title = title,
                        Url = web.ServerRelativeUrl + "/" + OPMConstants.OPMPages.SitePages + "/" + OPMConstants.OPMPages.ProcessLibraryPageName,
                        AsLastNode = true,
                        IsExternal = true
                    };
                    quickLaunchList.Add(nodeCreation);
                    isUpdate = true;
                }
                if (isUpdate)
                {
                    await clientContext.ExecuteQueryAsync();
                }

            }
            catch (Exception ex)
            {
                Logger.Log(LogLevel.Error, "Can't update quick lauch Process Library", ex.Message);
            }
        }

        private async ValueTask EnsurePageAsync(PortableClientContext clientContext, Web web, Group readerGroup)
        {
            List sitePageList = web.GetList(web.ServerRelativeUrl + "/" + OPMConstants.OPMPages.SitePages);
            clientContext.Load(sitePageList, l => l.RootFolder,
                l => l.EnableMinorVersions,
                l => l.EnableVersioning,
                l => l.EnableModeration,
                l => l.ParentWeb.CurrentUser.LoginName);
            await clientContext.ExecuteQueryAsync();

            string serverRelativePageName = web.ServerRelativeUrl + "/" + OPMConstants.OPMPages.SitePages + "/" + OPMConstants.OPMPages.ProcessLibraryPageName;
            var pageFile = clientContext.Web.GetFileByServerRelativeUrl(serverRelativePageName);
            clientContext.Web.Context.Load(pageFile,
                f => f.ListItemAllFields,
                f => f.Exists);

            await clientContext.Web.Context.ExecuteQueryAsync();

            if (!pageFile.Exists)
            {
                string id = Guid.NewGuid().ToString();
                ListItem item = sitePageList.RootFolder.Files.AddTemplateFile(serverRelativePageName, TemplateFileType.ClientSidePage).ListItemAllFields;
                item[OPMConstants.SharePoint.SharePointFields.ContentTypeId] = OPMConstants.OPMPages.ModernHomePage;
                item[OPMConstants.SharePoint.SharePointFields.ClientSideApplicationId] = OPMConstants.OPMPages.SitePagesFeatureId;
                item[OPMConstants.SharePoint.SharePointFields.PageLayoutType] = OPMConstants.OPMPages.SingleWebPartAppPageLayoutType;
                item[OPMConstants.SharePoint.SharePointFields.PromotedState] = "0";
                item[OPMConstants.SharePoint.SharePointFields.CanvasContent1] = string.Format(OPMConstants.ModerPageTemplate.Canvas, id, id, OPMConstants.ModerPageTemplate.ProcessLibraryComponent, "null");
                item[OPMConstants.SharePoint.SharePointFields.Title] = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ProcessLibraryQuickLauchName, web.Language);
                item.Update();
                clientContext.Web.Context.Load(item);
                if (sitePageList.EnableVersioning)
                {
                    item.File.Publish("");
                }

                await clientContext.Web.Context.ExecuteQueryAsync();

                pageFile = item.File;
            }

            clientContext.Web.Context.Load(pageFile, f => f.ListItemAllFields);
            clientContext.Web.Context.Load(pageFile.ListItemAllFields, l => l.HasUniqueRoleAssignments);
            await clientContext.Web.Context.ExecuteQueryAsync();

            if (!pageFile.ListItemAllFields.HasUniqueRoleAssignments)
            {
                pageFile.ListItemAllFields.BreakRoleInheritance(true, false);
            }

            pageFile.ListItemAllFields.RoleAssignments.Add(readerGroup,
                new RoleDefinitionBindingCollection(clientContext) { clientContext.Web.RoleDefinitions.GetByType(RoleType.Reader) });
            await clientContext.Web.Context.ExecuteQueryAsync();
        }

       
    }
}
