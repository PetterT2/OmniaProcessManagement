using Omnia.Fx.Contexts;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Models.BusinessProfiles.PropertyBag;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Models.Rollup.FilterValues;
using Omnia.Fx.Queries;
using Omnia.Fx.Tenant;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Helpers.Security;
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
        ITenantService TenantService { get; }
        IOmniaContext OmniaContext { get; }

        private IList<string> SpecialProperties
        {
            get
            {
                return OPMConstants.Database.TableProps.Processes.SearchableColumns;
            }
        }

        public ProcessHandleService(IEnterprisePropertyService enterprisePropertyService,
            IProcessService processService,
            IProcessSecurityService processSecurityService,
            IUserService userService,
            ITenantService tenantService,
            IOmniaContext omniaContext)
        {
            EnterprisePropertyService = enterprisePropertyService;
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
            UserService = userService;
            TenantService = tenantService;
            OmniaContext = omniaContext;
        }

        public async ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync(RollupFilter titleFilter)
        {
            var (enterpriseProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            var queryFilterResolver = new QueryFilterResolver(enterpriseProperties, SpecialProperties);

            var queryProcessesFunc = new Func<ItemQuery, ValueTask<ItemQueryResult<Process>>>(async (itemQuery) =>
            {
                return await QueryProcesses(itemQuery, titleFilter);
            });

            return new QueryBuilder<Process>(queryProcessesFunc, queryFilterResolver);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery, RollupFilter titleFilter)
        {
            ItemQueryResult<Process> result = null;
            var authorizedResource = await ProcessSecurityService.EnsureUserAuthorizedResourcesCacheAsync();
            string securityTrimmingQuery = SecurityTrimmingHelper.GenerateSecurityTrimming(authorizedResource, OmniaContext, null);

            List<string> titleFilters = await GetTitleFilterQuery(titleFilter);
            if (string.IsNullOrWhiteSpace(securityTrimmingQuery))
            {
                result = new ItemQueryResult<Process>()
                {
                    Items = new List<Process>(),
                    Total = 0
                };
            }
            else
            {
                result = await ProcessService.QueryProcesses(itemQuery, securityTrimmingQuery, titleFilters);
            }

            return result;
        }

        private async ValueTask<List<string>> GetTitleFilterQuery(RollupFilter titleFilter)
        {
            List<string> queries = new List<string>();
            if (titleFilter != null)
            {
                Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
                string tenantDefaultLanguage = await GetTenantDefaultLanguage();

                string currentUserPreferredLanguage = currentUser.PreferredLanguage.HasValue ?
                    GetLanguageTagString(currentUser.PreferredLanguage.Value) : tenantDefaultLanguage;

                var titleColumnName = "P.[Proptitle]";
                var filterValue = titleFilter.ValueObj.CastTo<RollupFilterValue, PrimitiveValueFilterValue>();
                string searchText = filterValue.Value.ToString();

                string query = @$"(ISJSON({titleColumnName}) > 0 AND (JSON_VALUE({titleColumnName}, '$.""{currentUserPreferredLanguage}""') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.""{tenantDefaultLanguage}""') LIKE '%{searchText}%' OR JSON_VALUE({titleColumnName}, '$.""{tenantDefaultLanguage}""') LIKE '%:""{searchText}%'))";
                queries.Add(query);

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
