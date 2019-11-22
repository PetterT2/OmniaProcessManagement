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

namespace Omnia.ProcessManagement.Core.Services.Features
{
    public class ProcessLibraryFeatureService : IProcessLibraryFeatureService
    {
        private ILogger<ProcessLibraryFeatureService> Logger { get; }
        private ILocalizationProvider LocalizationProvider { get; }
        private ISharePointClientContextProvider SPClientContextProvider { get; }


        public ProcessLibraryFeatureService(ILogger<ProcessLibraryFeatureService> logger,
            ILocalizationProvider localizationProvider,
            ISharePointClientContextProvider spClientContextProvider
        )
        {
            Logger = logger;
            LocalizationProvider = localizationProvider;
            SPClientContextProvider = spClientContextProvider;
        }

        public async ValueTask ActiveFeatureAsync(string spUrl, FeatureEventArg eventArg)
        {
            await Execute(spUrl, eventArg);
        }

        public async ValueTask DeactiveFeatureAsync(string spUrl)
        {
        }

        public async ValueTask UpgradeFeatureAsync(string fromVersion, string spUrl, FeatureEventArg eventArg)
        {
            await Execute(spUrl, eventArg);
        }

        private async ValueTask Execute(string spUrl, FeatureEventArg eventArg)
        {
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

            await EnsurePage(ctx, web);
            await ConfigQuickLaunch(ctx, web);
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

        private async ValueTask EnsurePage(PortableClientContext clientContext, Web web)
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
            }
            else
            {
                clientContext.Web.Context.Load(pageFile,
                f => f.CheckOutType,
                f => f.MinorVersion,
                f => f.CheckedOutByUser,
                f => f.Level);
                await clientContext.Web.Context.ExecuteQueryAsync();

                if ((!sitePageList.EnableVersioning || (pageFile.CheckOutType == CheckOutType.None && pageFile.MinorVersion == 0)) &&
                    pageFile.ListItemAllFields[OPMConstants.SharePoint.SharePointFields.PageLayoutType].ToString() != OPMConstants.OPMPages.SingleWebPartAppPageLayoutType)
                {
                    if (sitePageList.EnableVersioning)
                    {
                        pageFile.CheckOut();
                        await clientContext.Web.Context.ExecuteQueryAsync();
                    }

                    pageFile.ListItemAllFields[OPMConstants.SharePoint.SharePointFields.PageLayoutType] = OPMConstants.OPMPages.SingleWebPartAppPageLayoutType;
                    pageFile.ListItemAllFields.SystemUpdate();

                    var isCheckIn = await CheckInIfNeededAsync(clientContext, sitePageList, pageFile, "Set Single WebPart App Page Layout Type");
                    if (!isCheckIn)
                    {
                        await clientContext.Web.Context.ExecuteQueryAsync();
                    }
                    pageFile = await LoadRequiredInfoForVersioning(clientContext, serverRelativePageName);
                }

                await MigrateCDLSettings(clientContext, sitePageList, pageFile);
            }
        }

        private async ValueTask MigrateCDLSettings(PortableClientContext clientContext, List sitePageList, File pageFile)
        {
            //TO DO: migrate settings
        }

        private async ValueTask<bool> CheckInIfNeededAsync(PortableClientContext clientContext, List list, File file, string comment)
        {
            if (list != null)
            {
                if (list.EnableVersioning)
                {
                    file.CheckIn(comment, CheckinType.MajorCheckIn);
                    if (list.EnableMinorVersions &&
                        file.Level != FileLevel.Published)
                    {
                        file.Publish(comment);
                        if (list.EnableModeration)
                        {
                            file.Approve("Automatically approved");
                        }
                    }

                    await clientContext.Web.Context.ExecuteQueryAsync();
                    return true;
                }
            }
            return false;
        }

        private async ValueTask<File> LoadRequiredInfoForVersioning(PortableClientContext clientContext, string serverRelativePageName)
        {
            var file = clientContext.Web.GetFileByServerRelativeUrl(serverRelativePageName);

            clientContext.Web.Context.Load(file,
                f => f.ListItemAllFields,
                f => f.Exists,
                f => f.CheckOutType,
                f => f.MinorVersion,
                f => f.CheckedOutByUser,
                f => f.CheckedOutByUser.LoginName,
                f => f.Level);
            await clientContext.Web.Context.ExecuteQueryAsync();
            return file;
        }

    }
}
