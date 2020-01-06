using Microsoft.SharePoint.Client;
using Omnia.Fx.Apps.Helpers;
using Omnia.Fx.Caching;
using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Models.Security;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Security;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Services.Principal;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.Images;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Security;
using Omnia.ProcessManagement.Models.Settings;
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
        IPrincipalService PrincipalService { get; }

        ISettingsService SettingsService { get; }

        public ProcessSecurityService(
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext,
            IProcessService processService,
            IRoleService roleService,
            IPrincipalService principalService,
            ISettingsService settingsService,
            IOmniaMemoryDependencyCache omniaMemoryDependencyCache)
        {
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            ProcessService = processService;
            RoleService = roleService;
            PrincipalService = principalService;
            SettingsService = settingsService;
            CacheHelper = omniaMemoryDependencyCache.AddKeyHelper(this);
        }

        public async ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType versionType, List<Guid> limitedTeamAppIds = null, List<Guid> limitedOPMProcessIds = null)
        {
            var authorizedResource = await EnsureUserAuthorizedResourcesCacheAsync();
            var authorizedProcessQuery = new AuthorizedProcessByVersionQuery(versionType, authorizedResource, limitedTeamAppIds, limitedOPMProcessIds);
            return authorizedProcessQuery;
        }

        public async ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessByOPMProcessIdQueryAsync(Guid processStepId)
        {
            var authorizedResource = await EnsureUserAuthorizedResourcesCacheAsync();
            var authorizedProcessQuery = new AuthorizedProcessByProcessStepIdQuery(processStepId, authorizedResource, OmniaContext);
            return authorizedProcessQuery;
        }

        public async ValueTask<IAuthorizedImageReferenceQuery> InitAuthorizedImageReferenceQueryAsync(ImageReference imageRef, Guid opmProcessId)
        {
            var authorizedResource = await EnsureUserAuthorizedResourcesCacheAsync();
            var authorizedProcessQuery = new AuthorizedImageReferenceQuery(authorizedResource, imageRef, opmProcessId, OmniaContext);
            return authorizedProcessQuery;
        }

        public IOnlyTeamAppIdSecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppId)
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

        public async ValueTask<List<Microsoft.SharePoint.Client.User>> EnsureProcessLimitedReadAccessSharePointUsersAsync(PortableClientContext ctx, Guid opmProcessId)
        {
            var queryInput = new PermissionBindingsByResourcesQueryInput();
            queryInput.Resources.Add(SecurityResourceIdResourceHelper.GenerateResource(opmProcessId));
            queryInput.IncludeGroups = true;
            queryInput.IncludeUsers = true;

            var permissionBindings = await RoleService.GetIdentityPermissionBindingsForCurrentExtensionAsync(queryInput);

            var identities = permissionBindings.Where(p => p.UserDefinedRules == null || p.UserDefinedRules.Count == 0)
                .Select(p => new UserIdentity { Uid = p.Identity })
                .ToList();

            var userDefinedRulePermissionBinding = permissionBindings.Where(p => p.UserDefinedRules != null).FirstOrDefault();
            if (userDefinedRulePermissionBinding != null)
            {
                if (userDefinedRulePermissionBinding.UserDefinedRules.Any(u => u.RoleId == new Guid(Fx.Constants.Security.Roles.AuthorizedUsers)))
                {
                    identities.Add(new UserIdentity { Uid = Fx.Constants.Security.Roles.AuthorizedUsers });
                }

                if (userDefinedRulePermissionBinding.UserDefinedRules.Any(u => u.RoleId == new Guid(Fx.Constants.Security.Roles.InternalUsersOnly)))
                {
                    identities.Add(new UserIdentity { Uid = Fx.Constants.Security.Roles.InternalUsersOnly });
                }
            }

            var users = await PrincipalService.EnsureSharePointUsersAsync(ctx, identities);
            return users;
        }

        public async ValueTask<Guid> AddOrUpdateOPMReaderPermissionAsync(Guid teamAppId, Guid opmProcessId, List<UserIdentity> limitedUserItentities = null)
        {
            var securityResourceId = SecurityResourceIdResourceHelper.GetSecurityResourceIdForReader(teamAppId, opmProcessId, limitedUserItentities != null);

            if (securityResourceId == opmProcessId)
            {
                var permissionBindingsUpdateInput = new PermissionBindingsUpdateInput(PermissionBindingsUpdateInputOption.ExactSame);
                var resource = SecurityResourceIdResourceHelper.GenerateResource(securityResourceId);

                SetUpdateInput(permissionBindingsUpdateInput, new Guid(OPMConstants.Security.Roles.Reader), resource, limitedUserItentities);

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

        public async ValueTask AddOrUpdateOPMAuthorAndDefaultReaderAsync(PortableClientContext ctx, AuthorAndDefaultReaderUpdateInput updateInput)
        {
            var siteGroupIdSettings = await SettingsService.GetAsync<SiteGroupIdSettings>(updateInput.TeamAppId.ToString());


            if (siteGroupIdSettings == null)
                throw new Exception("Missing Process Author SharePoint group and Process Default Reader SharePoint group");

            //We try to not use other opm services in this service (except ProcessService) 
            //to make it as more independent as possible. 

            await ctx.LoadIfNeeded(ctx.Web, w => w.SiteGroups).ExecuteQueryIfNeededAsync();
            var authorGroup = ctx.Web.SiteGroups.FirstOrDefault(r => r.Id == siteGroupIdSettings.AuthorGroupId);
            var defaultReaderGroup = ctx.Web.SiteGroups.FirstOrDefault(r => r.Id == siteGroupIdSettings.DefaultReaderGroupId);

            if (authorGroup == null)
            {
                throw new Exception($"Cannot get Process Author SharePoint group with id: {siteGroupIdSettings.AuthorGroupId}");
            }
            else
            {
                ctx.Load(authorGroup.Users);
            }

            if (defaultReaderGroup == null)
            {
                throw new Exception($"Cannot get Process Default Reader SharePoint group with id: {siteGroupIdSettings.DefaultReaderGroupId}");
            }
            else
            {
                ctx.Load(defaultReaderGroup.Users);
            }

            await ctx.ExecuteQueryAsync();

            var permissionBindingsUpdateInput = new PermissionBindingsUpdateInput(PermissionBindingsUpdateInputOption.ExactSame);

            var authorResource = AppInstanceResourceHelper.GenerateResource(updateInput.TeamAppId).ToLower();
            var defaultReaderResource = SecurityResourceIdResourceHelper.GenerateResource(updateInput.TeamAppId);

            SetUpdateInput(permissionBindingsUpdateInput, new Guid(OPMConstants.Security.Roles.Author), authorResource, updateInput.Authors);
            SetUpdateInput(permissionBindingsUpdateInput, new Guid(OPMConstants.Security.Roles.Reader), defaultReaderResource, updateInput.DefaultReaders);

            await RoleService.UpdatePermissionBindingsForCurrentExtensionAsync(permissionBindingsUpdateInput);

            try
            {
                var authorSPUSers = updateInput.Authors != null && updateInput.Authors.Any() ?
                    await PrincipalService.EnsureSharePointUsersAsync(ctx, updateInput.Authors) :
                    new List<Microsoft.SharePoint.Client.User>();

                var defaultReaderSPUSers = updateInput.DefaultReaders != null && updateInput.DefaultReaders.Any() ?
                    await PrincipalService.EnsureSharePointUsersAsync(ctx, updateInput.DefaultReaders) :
                    new List<Microsoft.SharePoint.Client.User>();

                //The following code may be not good. 
                //We have the better solution implemented in Omnia. But the code is not exported in fx yet
                foreach (var user in authorGroup.Users.ToList())
                {
                    authorGroup.Users.Remove(user);
                }
                foreach (var user in defaultReaderGroup.Users.ToList())
                {
                    defaultReaderGroup.Users.Remove(user);
                }

                foreach (var user in authorSPUSers)
                {
                    authorGroup.Users.AddUser(user);
                }

                foreach (var user in defaultReaderSPUSers)
                {
                    defaultReaderGroup.Users.AddUser(user);
                }
                await ctx.ExecuteQueryAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Cannot sync the perission to SharePoint. {ex.Message} - {ex.StackTrace}", ex);
            }
        }

        private void SetUpdateInput(PermissionBindingsUpdateInput updateInput, Guid role, string resource, List<UserIdentity> identities)
        {
            var handler = updateInput.InitItemFor(role, resource);

            identities.ForEach(identity =>
            {
                if (identity.Uid == Fx.Constants.Security.Roles.AuthorizedUsers)
                {
                    handler.AddEveryone();
                }
                else if (identity.Uid == Fx.Constants.Security.Roles.InternalUsersOnly)
                {
                    handler.AddInternalOnly();
                }
                else if (identity.Uid.Contains("@"))
                {
                    handler.AddUsers(identity.Uid);
                }
                else if (Guid.TryParse(identity.Uid, out Guid groupId))
                {
                    handler.AddGroups(groupId);
                }
                else
                {
                    throw new Exception($"Invalid uid: {identity.Uid}");
                }
            });
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
