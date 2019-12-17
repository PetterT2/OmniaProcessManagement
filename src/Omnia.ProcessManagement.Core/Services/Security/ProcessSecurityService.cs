using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Models.Security;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Security;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers;
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
        IRoleService RoleService { get; }
        ISecurityProvider SecurityProvider { get; }
        IDynamicScopedContextProvider DynamicScopedContextProvider { get; }
        IOmniaContext OmniaContext { get; }
        IProcessRepository ProcessRepository { get; }

        public ProcessSecurityService(
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext,
            IProcessRepository processRepository,
            IRoleService roleService)
        {
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            ProcessRepository = processRepository;
            RoleService = roleService;
        }

        public IOPMSecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppId)
        {
            return new OPMSecurityResponse(teamAppId, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
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

        public async ValueTask<Guid> AddOrUpdateOPMReaderPermissionAsync(Guid teamAppId, Guid opmProcessId, List<UserIdentity> limitedUserItentities = null)
        {
            var securityResourceId = limitedUserItentities == null ? teamAppId : opmProcessId;

            if (securityResourceId == opmProcessId)
            {
                var permissionBindingsUpdateInput = new PermissionBindingsUpdateInput(PermissionBindingsUpdateInputOption.ExactSame);
                var resource = SecurityResourceIdResourceHelper.GenerateResource(securityResourceId);
                var readerHandler = permissionBindingsUpdateInput.InitItemFor(new Guid(OPMConstants.Security.Roles.Reader), resource);

                foreach (var userIdentity in limitedUserItentities)
                {
                    if (userIdentity.Uid.Contains("@"))
                    {
                        readerHandler.AddUsers(userIdentity.Uid);
                    }
                    else if (userIdentity.Uid == Fx.Constants.Security.Roles.AuthorizedUsers)
                    {
                        readerHandler.AddInternalOnly();
                    }
                    else if (userIdentity.Uid == Fx.Constants.Security.Roles.InternalUsersOnly)
                    {
                        readerHandler.AddInternalOnly();
                    }
                    else if (userIdentity.Uid == Fx.Constants.Security.Roles.AuthorizedUsers)
                    {
                        readerHandler.AddEveryone();
                    }
                    else if (Guid.TryParse(userIdentity.Uid, out Guid groupId))
                    {
                        readerHandler.AddGroups(groupId);
                    }
                    else
                    {
                        throw new Exception($"Invalid user identity: {userIdentity.Uid}");
                    }
                }


                await RoleService.UpdatePermissionBindingsForCurrentExtensionAsync(permissionBindingsUpdateInput);
            }

            return securityResourceId;
        }

        public async ValueTask AddOrUpdateOPMApproverPermissionAsync(Guid opmProcessId, string userLoginName)
        {
            await InternalAddOrUpdateOPMApproverPermissionAsync(opmProcessId, userLoginName);
        }

        public async ValueTask RemoveOPMApproverPermissionAsync(Guid opmProcessId)
        {
            await InternalAddOrUpdateOPMApproverPermissionAsync(opmProcessId);
        }

        private async ValueTask InternalAddOrUpdateOPMApproverPermissionAsync(Guid opmProcessId, params string[] userLoginNames)
        {
            if (userLoginNames.Length > 1)
                throw new Exception("Does not support multiple appover for one process");

            var permissionBindingsUpdateInput = new PermissionBindingsUpdateInput(PermissionBindingsUpdateInputOption.ExactSame);
            var resource = OPMProcessIdResourceHelper.GenerateResource(opmProcessId);
            var readerHandler = permissionBindingsUpdateInput.InitItemFor(new Guid(OPMConstants.Security.Roles.Approver), resource);
            readerHandler.AddUsers(userLoginNames);

            await RoleService.UpdatePermissionBindingsForCurrentExtensionAsync(permissionBindingsUpdateInput);
        }
    }
}
