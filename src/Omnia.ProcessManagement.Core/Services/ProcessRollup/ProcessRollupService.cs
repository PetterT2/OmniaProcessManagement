using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Omnia.Fx.Models.BusinessProfiles.PropertyBag;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.NetCore.Utils.Query;
using Omnia.Fx.Tenant;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.ProcessHandler;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessRollup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessRollup
{
    internal class ProcessRollupService : IProcessRollupService
    {
        IProcessHandleService ProcessHandleService { get; }
        IMultilingualHelper MultilingualHelper { get; }
        ITenantService TenantService { get; }
        IUserService UserService { get; }

        public ProcessRollupService(IProcessHandleService processHandleService, IMultilingualHelper multilingualHelper, ITenantService tenantService, IUserService userService)
        {
            ProcessHandleService = processHandleService;
            MultilingualHelper = multilingualHelper;
            TenantService = tenantService;
            UserService = userService;
        }

        public async ValueTask<RollupProcessResult> QueryProcessRollup(RollupSetting setting)
        {
            List<RollupFilter> titleFilters = new List<RollupFilter>();

            if (setting.CustomFilters != null && setting.CustomFilters.Count > 0)
            {
                titleFilters = setting.CustomFilters.Where(f => f.Property == "Title").ToList();
                setting.CustomFilters = setting.CustomFilters.Where(f => f.Property != "Title").ToList(); ;
            }

            if (setting.Resources[0].Filters != null && setting.Resources[0].Filters.Count > 0)
            {
                var titleQueries = setting.Resources[0].Filters.Where(f => f.Property == "Title").ToList();
                if (titleQueries.Count > 0)
                    titleFilters.AddRange(titleQueries);
                setting.Resources[0].Filters = setting.Resources[0].Filters.Where(f => f.Property != "Title").ToList(); ;
            }

            var helper = new RollupHelper(setting);
            var processQuery = await ProcessHandleService.BuildProcessQueryAsync(setting.Resources[0].Id, titleFilters);

            processQuery
            .Where(subItem => helper.ResolveResourcesFilters(subItem))
            .AndWhere(subItem => helper.ResolveCustomFilters(subItem));

            if (setting.Skip.HasValue)
            {
                processQuery.Skip(setting.Skip.Value).Take(setting.ItemLimit.Value);
            }

            if (setting.IncludeTotal)
                processQuery.IncludeTotal();

            foreach (var order in setting.OrderBy)
            {
                if (!string.IsNullOrEmpty(order.PropertyName))
                {
                    if (order.Descending)
                        processQuery.OrderByDescending(order.PropertyName);
                    else processQuery.OrderBy(order.PropertyName);
                }
            }

            var queryResult = await processQuery.GetResultAsync();

            var result = new RollupProcessResult
            {
                Total = queryResult.Total,
                Items = new List<RollupProcess>()
            };

            foreach (var process in queryResult.Items)
            {
                if (process != null)
                {
                    var returnProperties = new Dictionary<string, object>();
                    if (process.RootProcessStep.EnterpriseProperties != null)
                    {
                        if (process.RootProcessStep.EnterpriseProperties != null)
                        {
                            var internalNames = GetInternalNamesWithOnlyBuiltInTitle(setting.DisplayFields.ToList());
                            foreach (var internalName in internalNames)
                            {
                                if (process.RootProcessStep.EnterpriseProperties.TryGetValue(internalName, out JToken value))
                                {
                                    returnProperties.Add(internalName, value);
                                }
                            }
                        }
                    }

                    string processTitle = await GetDefaultProcessTitle(process.RootProcessStep.Title, titleFilters.FirstOrDefault());
                    returnProperties.Add(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.InternalName, processTitle);
                    if (setting.DisplayFields.Contains(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedAt.InternalName))
                        returnProperties.Add(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedAt.InternalName, process.CreatedAt);
                    if (setting.DisplayFields.Contains(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedBy.InternalName))
                        returnProperties.Add(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedBy.InternalName, process.CreatedBy);
                    if (setting.DisplayFields.Contains(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedAt.InternalName))
                        returnProperties.Add(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedAt.InternalName, process.ModifiedAt);
                    if (setting.DisplayFields.Contains(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedBy.InternalName))
                        returnProperties.Add(Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedBy.InternalName, process.ModifiedBy);

                    result.Items.Add(new RollupProcess
                    {
                        Process = process,
                        Properties = returnProperties
                    });
                }
            }

            return result;
        }

        private async ValueTask<string> GetDefaultProcessTitle(MultilingualString multilingualTitle, RollupFilter? titleFilter)
        {
            string result = "";

            Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
            LanguageTag? currentLanguage = currentUser.PreferredLanguage;
            var (defaultLanguage, availableLanguages) = await GetLanguageSettings();
            string filterText = "";
            if (titleFilter.IsNotNull())
                filterText = titleFilter.ValueObj.AdditionalProperties["searchValue"].ToString();

            if (multilingualTitle != null)
            {
                if (currentLanguage.IsNotNull() &&
                    multilingualTitle.ContainsKey((LanguageTag)currentLanguage) &&
                    !string.IsNullOrWhiteSpace(multilingualTitle[(LanguageTag)currentLanguage]))
                    result = multilingualTitle[(LanguageTag)currentLanguage];
                else if (defaultLanguage.IsNotNull() &&
                    multilingualTitle.ContainsKey((LanguageTag)defaultLanguage) &&
                    !string.IsNullOrWhiteSpace(multilingualTitle[(LanguageTag)defaultLanguage]))
                    result = multilingualTitle[(LanguageTag)defaultLanguage];
                else
                {
                    if (!string.IsNullOrEmpty(filterText))
                    {
                        foreach (var language in availableLanguages)
                        {
                            if (multilingualTitle.ContainsKey((LanguageTag)language) &&
                                !string.IsNullOrWhiteSpace(multilingualTitle[(LanguageTag)language]) && multilingualTitle[(LanguageTag)language].StartsWith(filterText))
                            {
                                result = multilingualTitle[(LanguageTag)language];
                                break;
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(result))
                    {
                        foreach (var locale in availableLanguages)
                        {
                            if (multilingualTitle.ContainsKey(locale) && !string.IsNullOrWhiteSpace(multilingualTitle[locale]))
                            {
                                result = multilingualTitle[locale];
                                break;
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(result))
                    {
                        foreach (var key in multilingualTitle.Keys)
                        {
                            if (!string.IsNullOrWhiteSpace(multilingualTitle[key]))
                            {
                                result = multilingualTitle[key];
                                break;
                            }
                        }
                    }
                }

            }

            return result;
        }

        private async ValueTask<(LanguageTag?, List<LanguageTag>)> GetLanguageSettings()
        {
            var properties = await TenantService.GetPropertyBag().GetAllValuesAsync();
            var tenantLanguageSettings = properties.GetModel<TenantPropertyLanguage>();

            LanguageTag? defaultLanguageTag = null;
            List<LanguageTag> availableLanguagesTags = new List<LanguageTag>();

            if (tenantLanguageSettings != null)
            {

                if (tenantLanguageSettings.Languages != null)
                {
                    availableLanguagesTags = tenantLanguageSettings.Languages.Select(l => l.Name).ToList();
                    var defaultLanguage = tenantLanguageSettings.Languages.FirstOrDefault(l => l.Default);
                    defaultLanguageTag = defaultLanguage != null ? defaultLanguage.Name : (LanguageTag?)null;
                }
            }

            return (defaultLanguageTag, availableLanguagesTags);
        }

        private List<string> GetInternalNamesWithOnlyBuiltInTitle(List<string> InternalNames)
        {
            var internalNames = new List<string>();
            if (InternalNames != null)
            {
                internalNames.AddRange(InternalNames);
                internalNames = internalNames.Where(name =>
                name != Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedAt.InternalName &&
                name != Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.CreatedBy.InternalName &&
                name != Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedAt.InternalName &&
                name != Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.ModifiedBy.InternalName).ToList();
            }

            return internalNames;
        }
    }
}
