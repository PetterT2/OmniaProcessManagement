using Omnia.Fx.Models.Rollup;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessRollup;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessRollup
{
    public interface IProcessRollupService
    {
        ValueTask<RollupProcessResult> QueryProcessRollup(RollupSetting setting);
        ValueTask<List<LightProcess>> QueryProcessRollupWithoutPermission(RollupSetting setting);
    }
}
