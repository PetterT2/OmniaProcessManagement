using Omnia.Fx.Apps.Helpers;
using Omnia.Fx.Caching;
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
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Security
{
    internal class ProcessSecurityService : IProcessSecurityService
    {
        private const string UserAuthorizedResources = "UserAuthorizedResources";

        IRoleService RoleService { get; }
        ISecurityProvider SecurityProvider { get; }
        IDynamicScopedContextProvider DynamicScopedContextProvider { get; }
        IOmniaContext OmniaContext { get; }
        IProcessService ProcessService { get; }
        IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> CacheHelper { get; }
        public ProcessSecurityService(
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext,
            IProcessService processService,
            IRoleService roleService,
            IOmniaMemoryDependencyCache omniaMemoryDependencyCache)
        {
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            ProcessService = processService;
            RoleService = roleService;
            CacheHelper = omniaMemoryDependencyCache.AddKeyHelper(this);
        }

        public ISecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppId)
        {
            return new SecurityResponse(teamAppId, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<ISecurityResponse> InitSecurityResponseByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType processVersionType)
        {
            var process = await ProcessService.GetInternalProcessByOPMProcessIdAsync(opmProcessId, processVersionType);
            return new SecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<ISecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, ProcessVersionType processVersionType)
        {
            var process = await ProcessService.GetInternalProcessByProcessStepIdAsync(processStepId, processVersionType);
            return new SecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<ISecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            var process = await ProcessService.GetInternalProcessByProcessStepIdAsync(processStepId, hash, versionType);
            return new SecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<ISecurityResponse> InitSecurityResponseByProcessIdAsync(Guid processId)
        {
            var process = await ProcessService.GetInternalProcessByProcessIdAsync(processId);
            return new SecurityResponse(process, DynamicScopedContextProvider, SecurityProvider, OmniaContext);
        }

        public async ValueTask<UserAuthorizedResource> EnsureUserAuthorizedResourcesCacheAsync()
        {
            var identity = OmniaContext.Identity.LoginName.ToLower();
            var cacheKey = CacheHelper.CreateKey(UserAuthorizedResources, identity.ToLower());
            var result = await CacheHelper.Instance.GetOrSetDependencyCacheAsync(cacheKey, async (cacheEntry) =>
            {
                var permissionBindingsCache = await SecurityProvider.EnsurePermissionBindingsByRolesCacheAsync(identity, SecurityTrimmingHelper.Roles());

                cacheEntry.Dependencies.Add(permissionBindingsCache);

                var resources = permissionBindingsCache.Value
                    .GroupBy(b => b.RoleId)
                    .ToDictionary(group => group.Key, items => items.Select(b => b.Resource).Distinct().ToList());
                return GetUserAuthorizedResource(resources);
            });

            return result.Value;
        }

        public async ValueTask<Guid> AddOrUpdateOPMReaderPermissionAsync(Guid teamAppId, Guid opmProcessId, List<UserIdentity> limitedUserItentities = null)
        {
            var securityResourceId = SecurityResourceIdResourceHelper.GetSecurityResourceIdForReader(teamAppId, opmProcessId, limitedUserItentities != null);

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

        private UserAuthorizedResource GetUserAuthorizedResource(IDictionary<Guid, List<string>> resources)
        {
            var result = new UserAuthorizedResource();
            if (resources != null)
            {
                foreach (var roleId in resources.Keys)
                {
                    var roleIdAsString = roleId.ToString().ToLower();
                    switch (roleIdAsString)
                    {
                        case OPMConstants.Security.Roles.Reader:
                            result.ReaderSecurityResourceIds.AddRange(SecurityResourceIdResourceHelper.ParseSecurityResourceIds(resources[roleId]));
                            break;
                        case OPMConstants.Security.Roles.Approver:
                            result.ApproverOPMProcessIds.AddRange(OPMProcessIdResourceHelper.ParseOPMProcessIds(resources[roleId]));
                            break;
                        case OPMConstants.Security.Roles.Reviewer:
                            result.ReviewerOPMProcessIds.AddRange(OPMProcessIdResourceHelper.ParseOPMProcessIds(resources[roleId]));
                            break;
                        case OPMConstants.Security.Roles.Author:
                            result.AuthorTeamAppIds.AddRange(ParseTeamAppIds(resources[roleId]));
                            break;
                    }
                }
            }
            return result;
        }

        private List<Guid> ParseTeamAppIds(List<string> resources)
        {
            var result = new List<Guid>();
            foreach (var resource in resources)
            {
                if (AppInstanceResourceHelper.TryParseAppInstanceId(resource, out Guid publishingAppId))
                {
                    result.Add(publishingAppId);
                }
            }

            result = result.Distinct().ToList();

            return result;
        }
    }
}
