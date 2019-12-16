using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Omnia.Fx.Models.Language;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class ProcessLibraryService : IProcessLibraryService
    {
        IProcessService ProcessService { get; }
        private ISharePointClientContextProvider SharePointClientContextProvider { get; }
        private IUserService UserService { get; }

        public ProcessLibraryService(IProcessService processService,
            ISharePointClientContextProvider sharePointClientContextProvider,
            IUserService userService)
        {
            ProcessService = processService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            UserService = userService;
        }


        public async ValueTask<List<Process>> GetProcessesDataAsync(string webUrl, ProcessVersionType versionType)
        {
            var (siteId, webId, language) = await GetProcessSiteInfo(webUrl);
            var processes = await ProcessService.GetProcessesDataAsync(siteId, webId, versionType);

            return processes;
        }


        public async ValueTask<(Guid, Guid, LanguageTag)> GetProcessSiteInfo(string webUrl)
        {
            PortableClientContext ctx = SharePointClientContextProvider.CreateClientContext(webUrl);
            ctx.Load(ctx.Site, s => s.Id);
            ctx.Load(ctx.Web, s => s.Id);
            ctx.Load(ctx.Web.CurrentUser, us => us.LoginName);
            await ctx.ExecuteQueryAsync();
            List<Fx.Models.Users.User> users = await UserService.GetByPrincipalNamesAsync(new List<string> { ctx.Web.CurrentUser.LoginName });
            LanguageTag language = LanguageTag.EnUs;
            if (users.Count > 0 && users.FirstOrDefault().PreferredLanguage.HasValue)
                language = users.FirstOrDefault().PreferredLanguage.Value;
            return (ctx.Site.Id, ctx.Web.Id, language);
        }

        #region Utils

        private string GetMultilingualStringValue(MultilingualString value, LanguageTag language)
        {
            return value.Keys.Contains(language) ? value[language] : value.FirstOrDefault().Value;
        }

        #endregion
    }
}
