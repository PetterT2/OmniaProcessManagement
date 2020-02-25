using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Models.BusinessProfiles.PropertyBag;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Queries;
using Omnia.Fx.Tenant;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessHandler
{
    internal class ProcessHandleService : IProcessHandleService
    {
        private static Dictionary<LanguageTag, string> _enumStringValues = new Dictionary<LanguageTag, string>();
        IProcessService ProcessService { get; }
        IEnterprisePropertyService EnterprisePropertyService { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        IUserService UserService { get; }
        private ITenantService TenantService { get; }

        private IList<string> DefaultAppProperties
        {
            get
            {
                return OPMConstants.Database.TableProps.Processes.Properties;
            }
        }

        private ProcessVersionType VersionType;
        private List<RollupFilter> TitleFilters;

        public ProcessHandleService(IEnterprisePropertyService enterprisePropertyService,
            IProcessService processService,
            IProcessSecurityService processSecurityService,
            IUserService userService,
            ITenantService tenantService)
        {
            EnterprisePropertyService = enterprisePropertyService;
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
            UserService = userService;
            TenantService = tenantService;
        }

        public async ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync(string versionTypeStr, List<RollupFilter> titleFilters, bool excludeSecurityTrimming = false)
        {
            Enum.TryParse(versionTypeStr, out VersionType);
            TitleFilters = titleFilters;
            var (enterpriseProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            var queryFilterResolver = new QueryFilterResolver(enterpriseProperties, DefaultAppProperties);
            if(excludeSecurityTrimming == true)
                return new QueryBuilder<Process>(QueryProcessesWithoutPermission, queryFilterResolver);
            else
                return new QueryBuilder<Process>(QueryProcesses, queryFilterResolver);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery)
        {
            string securityTrimmingQuery = await ProcessSecurityService.GetRollupSecurityTrimmingQuery(VersionType);
            List<string> titleFilters = await GetTitleFilterQuery();
            return await ProcessService.QueryProcesses(itemQuery, securityTrimmingQuery, titleFilters);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcessesWithoutPermission(ItemQuery itemQuery)
        {
            List<string> titleFilters = await GetTitleFilterQuery();
            return await ProcessService.QueryProcesses(itemQuery, "", titleFilters);
        }

        private async ValueTask<List<string>> GetTitleFilterQuery()
        {
            List<string> queries = new List<string>();
            if (TitleFilters != null && TitleFilters.Count > 0)
            {
                Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
                string tenantDefaultLanguage = await GetTenantDefaultLanguage();

                string currentUserPreferredLanguage = currentUser.PreferredLanguage.HasValue ?
                    GetLanguageTagString(currentUser.PreferredLanguage.Value) : tenantDefaultLanguage;

                var titleColumnName = "P.[Proptitle]";
                foreach (var filter in TitleFilters)
                {
                    string searchText = filter.ValueObj.AdditionalProperties["searchValue"].ToString();
                    string query = @$"(ISJSON({titleColumnName}) > 0 AND (JSON_VALUE({titleColumnName}, '$.""{currentUserPreferredLanguage}""') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.""{tenantDefaultLanguage}""') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.""{tenantDefaultLanguage}""') LIKE '%:""{searchText}%'))";
                    queries.Add(query);
                }
            }
            return queries;
        }

        private async ValueTask<string> GetTenantDefaultLanguage()
        {
            string tenantDefaultLanguage = "";

            var properties = await TenantService.GetPropertyBag().GetAllValuesAsync();
            var tenantLanguageSettings = properties.GetModel<TenantPropertyLanguage>();

            if (tenantLanguageSettings != null)
            {
                if (tenantLanguageSettings.Languages != null)
                {
                    var defaultLanguage = tenantLanguageSettings.Languages.FirstOrDefault(l => l.Default);
                    if (defaultLanguage != null)
                    {
                        tenantDefaultLanguage = GetLanguageTagString(defaultLanguage.Name);
                    }
                }
            }

            return tenantDefaultLanguage;
        }

        private string GetLanguageTagString(LanguageTag type)
        {
            if (!_enumStringValues.ContainsKey(type))
            {
                var enumType = typeof(LanguageTag);
                var name = Enum.GetName(enumType, type);
                var enumMemberAttribute = ((EnumMemberAttribute[])enumType.GetField(name).GetCustomAttributes(typeof(EnumMemberAttribute), true)).Single();
                var stringValue = enumMemberAttribute.Value;
                _enumStringValues[type] = stringValue;
            }
            return _enumStringValues[type];
        }
    }
}
