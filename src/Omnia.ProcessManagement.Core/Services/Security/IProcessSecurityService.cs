using Omnia.Fx.Models.Users;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Security
{
    public interface IProcessSecurityService
    {
        IOPMSecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppId);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType processVersionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, string hash, ProcessVersionType versionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, ProcessVersionType processVersionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessIdAsync(Guid processId);

        ValueTask<UserAuthorizedResource> EnsureUserAuthorizedResourcesCacheAsync();

        /// <summary>
        /// 
        /// </summary>
        /// <param name="teamAppId"></param>
        /// <param name="opmProcessId"></param>
        /// <param name="limitedUserItentities">null mean using default reader</param>
        /// <returns></returns>
        ValueTask<Guid> AddOrUpdateOPMReaderPermissionAsync(Guid teamAppId, Guid opmProcessId, List<UserIdentity> limitedUserItentities = null);

        ValueTask AddOrUpdateOPMApproverPermissionAsync(Guid opmProcessId, string userLoginName);
        ValueTask RemoveOPMApproverPermissionAsync(Guid opmProcessId);
    }
}
