using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.Queries;
using Omnia.ProcessManagement.Core.Services.Processes;
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

        private IList<string> DefaultAppProperties
        {
            get
            {
                return OPMConstants.Database.TableProps.Processes.Properties;
            }
        }

        public ProcessHandleService(IEnterprisePropertyService enterprisePropertyService, IProcessService processService)
        {
            EnterprisePropertyService = enterprisePropertyService;
            ProcessService = processService;
        }

        public async ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync()
        {
            var (enterpriseProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            var queryFilterResolver = new QueryFilterResolver(enterpriseProperties, DefaultAppProperties);
            return new QueryBuilder<Process>(QueryProcesses, queryFilterResolver);
        }

        protected async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery)
        {
            return await ProcessService.QueryProcesses(itemQuery);
        }
    }
}
