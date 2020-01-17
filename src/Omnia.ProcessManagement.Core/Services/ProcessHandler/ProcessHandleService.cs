using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Queries;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessHandler
{
    internal class ProcessHandleService : IProcessHandleService
    {
        IProcessService ProcessService { get; }
        IEnterprisePropertyService EnterprisePropertyService { get; }
        IProcessSecurityService ProcessSecurityService { get; }

        private IList<string> DefaultAppProperties
        {
            get
            {
                return OPMConstants.Database.TableProps.Processes.Properties;
            }
        }

        private ProcessVersionType VersionType;
        private List<RollupFilter> TitleFilters;
        private List<RollupFilter> TitleQueries;

        public ProcessHandleService(IEnterprisePropertyService enterprisePropertyService, IProcessService processService, IProcessSecurityService processSecurityService)
        {
            EnterprisePropertyService = enterprisePropertyService;
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
        }

        public async ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync(string versionTypeStr, List<RollupFilter> titleFilters, List<RollupFilter> titleQueries)
        {
            Enum.TryParse(versionTypeStr, out VersionType);
            TitleFilters = titleFilters;
            TitleQueries = titleQueries;
            var (enterpriseProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            var queryFilterResolver = new QueryFilterResolver(enterpriseProperties, DefaultAppProperties);
            return new QueryBuilder<Process>(QueryProcesses, queryFilterResolver);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery)
        {
            string securityTrimmingQuery = await ProcessSecurityService.GetRollupSecurityTrimmingQuery(VersionType);
            List<string> titleFilters = await GetTitleFilterQuery();
            List<string> titleQueries = await GetTitleQueryQuery();
            titleFilters.AddRange(titleQueries);
            return await ProcessService.QueryProcesses(itemQuery, securityTrimmingQuery, titleFilters);
        }

        private async ValueTask<List<string>> GetTitleFilterQuery() 
        {
            List<string> queries = new List<string>();
            if(TitleFilters != null && TitleFilters.Count > 0)
            {

            }
            return queries;
        }

        private async ValueTask<List<string>> GetTitleQueryQuery()
        {
            List<string> queries = new List<string>();
            if (TitleQueries != null && TitleQueries.Count > 0)
            {

            }
            return queries;
        }
    }
}
