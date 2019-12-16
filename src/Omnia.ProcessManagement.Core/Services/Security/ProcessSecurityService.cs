using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Security;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Security
{
    internal class ProcessSecurityService : IProcessSecurityService
    {
        ISecurityProvider SecurityProvider { get; }
        IDynamicScopedContextProvider DynamicScopedContextProvider { get; }
        IOmniaContext OmniaContext { get; }
        IProcessRepository ProcessRepository { get; }
        public ProcessSecurityService(
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext,
            IProcessRepository processRepository)
        {
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            ProcessRepository = processRepository;
        }

        public IOPMSecurityResponse InitSecurityResponseBySiteIdAndWebId(Guid siteId, Guid webId)
        {
            return new OPMSecurityResponse(siteId, webId, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<IOPMSecurityResponse> InitSecurityResponseByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType processVersionType)
        {
            var process = await ProcessRepository.GetInternalProcessByOPMProcessIdAsync(opmProcessId, processVersionType);
            return new OPMSecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, ProcessVersionType processVersionType)
        {
            var process = await ProcessRepository.GetInternalProcessByProcessStepIdAsync(processStepId, processVersionType);
            return new OPMSecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            var process = await ProcessRepository.GetInternalProcessByProcessStepIdAsync(processStepId, hash, versionType);
            return new OPMSecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<IOPMSecurityResponse> InitSecurityResponseByProcessIdAsync(Guid processId)
        {
            var process = await ProcessRepository.GetInternalProcessByProcessIdAsync(processId);
            return new OPMSecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }
    }
}
