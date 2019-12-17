using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Security
{
    public interface IProcessSecurityService
    {
        IOPMSecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppInstanceId);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType processVersionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, string hash, ProcessVersionType versionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, ProcessVersionType processVersionType);
        ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessIdAsync(Guid processId);
    }
}
