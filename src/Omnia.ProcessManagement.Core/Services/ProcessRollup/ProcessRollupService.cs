using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.BusinessProfiles.PropertyBag;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Models.Rollup.FilterValues;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.NetCore.Utils.Query;
using Omnia.Fx.Queries;
using Omnia.Fx.Tenant;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.ProcessHandler;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessRollup;
using System;
using System.Collections.Generic;
using System.Linq;
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
            var (processQuery, titleFilter) = await GetProcessQuery(setting);

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

                    string processTitle = await GetDefaultProcessTitle(process.RootProcessStep.Title, titleFilter);

                    result.Items.Add(new RollupProcess
                    {
                        Process = process,
                        SearchTitle = processTitle
                    });
                }
            }

            return result;
        }


        private async ValueTask<(IOmniaQueryable<Process>, RollupFilter)> GetProcessQuery(RollupSetting setting)
        {
            RollupFilter titleFilter = null;
            int searchBoxType = 80; //80 is searchBox filter type. temporarily use and wait for omnia fx

            //Ensure not title filter in Resources
            //Ensure only rollup published or archived processes
            if (setting.Resources == null || setting.Resources.Count == 0)
            {
                throw new Exception("Invalid Process query: Resources is required.");
            }

            foreach (var resource in setting.Resources)
            {
                int resourceVersion = 0;
                if (resource.Filters != null && resource.Filters.Any(f => f.Property == Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.InternalName))
                {
                    throw new Exception("Invalid Process query: Process title is not supported in query, switch to use filter instead.");
                }

                if (string.IsNullOrEmpty(resource.Id) || !int.TryParse(resource.Id, out resourceVersion) ||
                    (resourceVersion != (int)ProcessVersionType.Published && resourceVersion != (int)ProcessVersionType.Archived))
                {
                    throw new Exception("Invalid Process query: resources is invalid, only support query Published or Archived processes.");
                }
            }

            if (setting.CustomFilters != null && setting.CustomFilters.Count > 0)
            {
                titleFilter = setting.CustomFilters.Where(f => f.Property == Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.InternalName).FirstOrDefault();

                var searchBoxFilter = setting.CustomFilters.FirstOrDefault(f => (int)f.Type == searchBoxType);

                setting.CustomFilters = setting.CustomFilters.Where(f => f.Property != Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.InternalName && (int)f.Type != searchBoxType).ToList();

                if (searchBoxFilter != null)
                {
                    if (titleFilter != null)
                    {
                        throw new Exception("Does not allow to have more than 1 filter on title property");
                    }

                    var searchBoxFilterValue = searchBoxFilter.ValueObj.CastTo<RollupFilterValue, TexSearchestPropFilterValue>();
                    if (!string.IsNullOrWhiteSpace(searchBoxFilterValue.Value))
                    {
                        if (int.TryParse(searchBoxFilterValue.Value.ToString(), out int opmProcessIdNumber))
                        {
                            var valueObj = new BaseValueFilterValue<int>();
                            valueObj.Value = opmProcessIdNumber;

                            setting.CustomFilters.Add(new RollupFilter
                            {
                                Property = OPMConstants.Features.OPMDefaultProperties.OPMProcessIdNumber.InternalName,
                                Type = PropertyIndexedType.Number,
                                ValueObj = valueObj
                            });
                        }
                        else
                        {
                            var valueObj = new PrimitiveValueFilterValue();
                            valueObj.Value = searchBoxFilterValue.Value;

                            titleFilter = new RollupFilter
                            {
                                Property = Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.InternalName,
                                Type = PropertyIndexedType.Text,
                                ValueObj = valueObj
                            };
                        }
                    }
                }
            }


            var helper = new RollupHelper(setting);
            var processQuery = await ProcessHandleService.BuildProcessQueryAsync(titleFilter);

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

            return (processQuery, titleFilter);
        }

        private async ValueTask<string> GetDefaultProcessTitle(MultilingualString multilingualTitle, RollupFilter? titleFilter)
        {
            string result = "";

            Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
            LanguageTag? currentLanguage = currentUser.PreferredLanguage;
            var (defaultLanguage, availableLanguages) = await GetLanguageSettings();
            string filterText = "";
            if (titleFilter.IsNotNull())
            {
                var searchBoxFilterValue = titleFilter.ValueObj.CastTo<RollupFilterValue, TexSearchestPropFilterValue>();
                filterText = searchBoxFilterValue.Value;
            }

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
