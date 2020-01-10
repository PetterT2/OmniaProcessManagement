using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.NetCore.Utils.Query;
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
    internal class ProcessRollupService: IProcessRollupService
    {
        IProcessHandleService ProcessHandleService { get; }
        IMultilingualHelper MultilingualHelper { get; }

        public ProcessRollupService(IProcessHandleService processHandleService, IMultilingualHelper multilingualHelper) 
        {
            ProcessHandleService = processHandleService;
            MultilingualHelper = multilingualHelper;
        }

        public async ValueTask<RollupProcessResult> QueryProcessRollup(RollupSetting setting)
        {
            var helper = new RollupHelper(setting);
            var processQuery = await ProcessHandleService.BuildProcessQueryAsync();

            processQuery
            .Where(subItem => subItem.Property(OPMConstants.Database.TableProps.Processes.VersionType).NotEqual(ProcessVersionType.Draft))
            .AndWhere(subItem => subItem.Property(OPMConstants.Database.TableProps.Processes.VersionType).NotEqual(ProcessVersionType.CheckedOut))
            .AndWhere(subItem => helper.ResolveResourcesFilters(subItem))
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

                    string processTitle = await MultilingualHelper.GetDafaultValue(process.RootProcessStep.Title, Guid.Empty);
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
                        Id = process.Id,
                        Properties = returnProperties
                    });
                }
            }

            return result;
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
