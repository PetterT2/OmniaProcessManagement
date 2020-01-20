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
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessHandler
{
    internal class ProcessHandleService : IProcessHandleService
    {
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

        public async ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync(string versionTypeStr, List<RollupFilter> titleFilters)
        {
            Enum.TryParse(versionTypeStr, out VersionType);
            TitleFilters = titleFilters;
            var (enterpriseProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            var queryFilterResolver = new QueryFilterResolver(enterpriseProperties, DefaultAppProperties);
            return new QueryBuilder<Process>(QueryProcesses, queryFilterResolver);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery)
        {
            string securityTrimmingQuery = await ProcessSecurityService.GetRollupSecurityTrimmingQuery(VersionType);
            List<string> titleFilters = await GetTitleFilterQuery();
            return await ProcessService.QueryProcesses(itemQuery, securityTrimmingQuery, titleFilters);
        }

        private async ValueTask<List<string>> GetTitleFilterQuery() 
        {
            List<string> queries = new List<string>();
            if(TitleFilters != null && TitleFilters.Count > 0)
            {
                Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
                string currentUserPreferredLanguage = currentUser.PreferredLanguage.ToString().ToLower().Replace("-", "");
                string tenantDefaultLanguage = await GetTenantDefaultLanguage();

                var titleColumnName = "P.[Proptitle]";
                foreach (var filter in TitleFilters)
                {
                    string searchText = filter.ValueObj.AdditionalProperties["searchValue"].ToString();
                    string query = @$"(ISJSON({titleColumnName}) > 0 AND (JSON_VALUE({titleColumnName}, '$.{currentUserPreferredLanguage}') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.{tenantDefaultLanguage}') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.{tenantDefaultLanguage}') LIKE '%:""{searchText}""%'))";
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
                    if(defaultLanguage != null)
                    {
                        tenantDefaultLanguage = defaultLanguage.Name.ToString().ToLower().Replace("-", "");
                    }
                }
            }

            return tenantDefaultLanguage;
        }
    }
}
