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
using Omnia.ProcessManagement.Models.ProcessLibrary;

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


        public async ValueTask<DraftProcessesResponse> GetDraftProcessesDataAsync(ProcessLibraryRequest processLibraryRequest)
        {
            var (siteId, webId, language) = await GetProcessSiteInfo(processLibraryRequest.WebUrl);
            var processes = await ProcessService.GetDraftProcessesDataAsync(siteId, webId);
            int total = processes.Count;

            processes = ApplyFilters(processLibraryRequest, processes, language);
            ApplySorting(processLibraryRequest, processes, language);

            if (processLibraryRequest.PageSize > 0)
                processes = processes.Skip((processLibraryRequest.PageNum - 1) * processLibraryRequest.PageSize)
                    .Take(processLibraryRequest.PageSize).ToList();

            return new DraftProcessesResponse
            {
                Total = total,
                Processes = processes
            };
        }

        public async ValueTask<List<string>> GetFilterOptions(string webUrl, string column)
        {
            var (siteId, webId, language) = await GetProcessSiteInfo(webUrl);
            var processes = await ProcessService.GetDraftProcessesDataAsync(siteId, webId);
            if (column == OPMConstants.ProcessColumns.Title)
                return processes.Select(p => GetMultilingualStringValue(p.RootProcessStep.Title, language)).ToList();
            return processes.Select(p => column).ToList();
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

        private void ApplySorting(ProcessLibraryRequest processLibraryRequest, List<Process> processes, LanguageTag language)
        {
            if (!string.IsNullOrEmpty(processLibraryRequest.SortBy))
                processes.Sort(delegate (Process x, Process y)
                {
                    int compare = 0;
                    switch (processLibraryRequest.SortBy)
                    {
                        case OPMConstants.ProcessColumns.Title:
                            compare = GetMultilingualStringValue(x.RootProcessStep.Title, language).CompareTo(GetMultilingualStringValue(y.RootProcessStep.Title, language));
                            break;
                    }
                    if (!processLibraryRequest.SortAsc)
                    {
                        compare = compare == 1 ? -1 : compare == -1 ? 1 : 0;
                    }
                    return compare;
                });
        }

        private List<Process> ApplyFilters(ProcessLibraryRequest processLibraryRequest, List<Process> processes, LanguageTag language)
        {
            if (processLibraryRequest.Filters != null && processLibraryRequest.Filters.Any())
            {
                foreach (string key in processLibraryRequest.Filters.Keys)
                {
                    switch (key)
                    {
                        case OPMConstants.ProcessColumns.Title:
                            List<string> values = processLibraryRequest.Filters[key];
                            processes = processes.Where(p => values.Any(value => GetMultilingualStringValue(p.RootProcessStep.Title, language).Contains(value))).ToList();
                            break;
                    }
                }
            }

            return processes;
        }

        #endregion
    }
}
