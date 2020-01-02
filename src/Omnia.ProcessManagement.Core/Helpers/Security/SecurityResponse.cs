using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Models.Security;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Security;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Helpers.Security
{
    public interface IOnlyTeamAppIdSecurityResponse
    {
        IOnlyTeamAppIdSecurityResponseHandler RequireTeamAppAdmin(params ProcessVersionType[] versionTypes);
        IOnlyTeamAppIdSecurityResponseHandler RequireAuthor(params ProcessVersionType[] versionTypes);
    }

    public interface IOnlyTeamAppIdSecurityResponseHandler
    {
        IOnlyTeamAppIdSecurityResponseHandler OrRequireTeamAppAdmin(params ProcessVersionType[] versionTypes);
        IOnlyTeamAppIdSecurityResponseHandler OrRequireAuthor(params ProcessVersionType[] versionTypes);
        ValueTask<T> DoAsync<T>(Func<ValueTask<T>> action);
    }

    public interface ISecurityResponse
    {
        ISecurityResponseHandler RequireTeamAppAdmin(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler RequireAuthor(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler RequireReviewer(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler RequireApprover(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler RequireReader(params ProcessVersionType[] versionTypes);

    }

    public interface ISecurityResponseHandler
    {
        ISecurityResponseHandler OrRequireTeamAppAdmin(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler OrRequireAuthor(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler OrRequireReviewer(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler OrRequireApprover(params ProcessVersionType[] versionTypes);
        ISecurityResponseHandler OrRequireReader(params ProcessVersionType[] versionTypes);
        ValueTask<T> DoAsync<T>(Func<ValueTask<T>> action);
        ValueTask<T> DoAsync<T>(Func<Guid, ValueTask<T>> action);
        internal ValueTask<T> DoAsync<T>(Func<Guid, InternalProcess, ValueTask<T>> action);
    }

    internal class SecurityResponse : ISecurityResponse, ISecurityResponseHandler, IOnlyTeamAppIdSecurityResponse, IOnlyTeamAppIdSecurityResponseHandler
    {
        private List<Guid> RequiredRoles { get; }
        private InternalProcess Process { get; set; }
        private Guid TeamAppId { get; set; }
        private IDynamicScopedContextProvider DynamicScopedContextProvider { get; }
        private ISecurityProvider SecurityProvider { get; }
        private IOmniaContext OmniaContext { get; }
        private bool AuthorOnly { get; }
        public SecurityResponse(
            InternalProcess process,
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext)
        {
            RequiredRoles = new List<Guid>();
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            Process = process;
            TeamAppId = Process.TeamAppId;
        }

        public SecurityResponse(
            Guid teamAppId,
            IDynamicScopedContextProvider dynamicScopedContextProvider,
            ISecurityProvider securityProvider,
            IOmniaContext omniaContext)
        {
            RequiredRoles = new List<Guid>();
            DynamicScopedContextProvider = dynamicScopedContextProvider;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            TeamAppId = teamAppId;
            AuthorOnly = true;
        }

        IOnlyTeamAppIdSecurityResponseHandler IOnlyTeamAppIdSecurityResponse.RequireTeamAppAdmin(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(Fx.Constants.Security.Roles.AppInstanceAdmin, versionTypes);
            return this;
        }
        IOnlyTeamAppIdSecurityResponseHandler IOnlyTeamAppIdSecurityResponseHandler.OrRequireTeamAppAdmin(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(Fx.Constants.Security.Roles.AppInstanceAdmin, versionTypes);
            return this;
        }
        IOnlyTeamAppIdSecurityResponseHandler IOnlyTeamAppIdSecurityResponse.RequireAuthor(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Author, versionTypes);
            return this;
        }

        IOnlyTeamAppIdSecurityResponseHandler IOnlyTeamAppIdSecurityResponseHandler.OrRequireAuthor(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Author, versionTypes);
            return this;
        }


        public ISecurityResponseHandler RequireTeamAppAdmin(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(Fx.Constants.Security.Roles.AppInstanceAdmin, versionTypes);
            return this;
        }
        public ISecurityResponseHandler OrRequireTeamAppAdmin(params ProcessVersionType[] versionTypes)
        {
            return RequireTeamAppAdmin(versionTypes);
        }
        public ISecurityResponseHandler RequireAuthor(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Author, versionTypes);
            return this;
        }

        public ISecurityResponseHandler OrRequireAuthor(params ProcessVersionType[] versionTypes)
        {
            return RequireAuthor(versionTypes);
        }

        public ISecurityResponseHandler RequireApprover(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Approver, versionTypes);
            return this;
        }

        public ISecurityResponseHandler OrRequireApprover(params ProcessVersionType[] versionTypes)
        {
            return RequireApprover(versionTypes);
        }

        public ISecurityResponseHandler RequireReviewer(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Reviewer, versionTypes);
            return this;
        }

        public ISecurityResponseHandler OrRequireReviewer(params ProcessVersionType[] versionTypes)
        {
            return RequireApprover(versionTypes);
        }

        public ISecurityResponseHandler RequireReader(params ProcessVersionType[] versionTypes)
        {
            EnsureRole(OPMConstants.Security.Roles.Reader, versionTypes);
            return this;
        }

        public ISecurityResponseHandler OrRequireReader(params ProcessVersionType[] versionTypes)
        {
            return RequireApprover(versionTypes);
        }

        async ValueTask<T> ISecurityResponseHandler.DoAsync<T>(Func<Guid, InternalProcess, ValueTask<T>> action)
        {
            if (action == null)
                throw new ArgumentNullException();

            var isAuthorized = await ValidateAuthorized();
            if (!isAuthorized)
            {
                throw new Exception("Forbidden");
            }

            return await action(TeamAppId, Process);
        }


        public async ValueTask<T> DoAsync<T>(Func<Guid, ValueTask<T>> action)
        {
            if (action == null)
                throw new ArgumentNullException();

            var isAuthorized = await ValidateAuthorized();
            if (!isAuthorized)
            {
                throw new Exception("Forbidden");
            }

            return await action(TeamAppId);
        }

        
        public async ValueTask<T> DoAsync<T>(Func<ValueTask<T>> action)
        {
            if (action == null)
                throw new ArgumentNullException();

            var isAuthorized = await ValidateAuthorized();
            if (!isAuthorized)
            {
                throw new Exception("Forbidden");
            }

            return await action();
        }

        
        private async ValueTask<bool> ValidateAuthorized()
        {

            var isAuthorized = true;
            if (RequiredRoles.Count > 0)
            {
                EnsureContextParamsAsync();

                var identityRolesResult = await SecurityProvider.GetIdentityRolesForCurrentServiceAsync(OmniaContext.Identity.LoginName);
                var identityRoles = identityRolesResult.Values
                    .Where(r => r.HasPermission == true)
                    .Select(r => r.RoleId)
                    .ToList();
                isAuthorized = identityRoles.Any(
                    roleId => roleId == Omnia.Fx.Constants.Security.RoleDefinitions.ApiFullControl.Id || RequiredRoles.Contains(roleId));
            }
            return isAuthorized;// || true; //TODO - remove true here when finish;
        }

        private void EnsureRole(string roleIdString, params ProcessVersionType[] versionTypes)
        {
            if (!CheckVersionTypesInEnsuringRole(versionTypes))
            {
                return;
            }

            var role = new Guid(roleIdString);
            if (!RequiredRoles.Contains(role))
            {
                RequiredRoles.Add(role);
            }
        }

        private bool CheckVersionTypesInEnsuringRole(params ProcessVersionType[] versionTypes)
        {
            var isValid = true;
            if (versionTypes.Length > 0)
            {
                isValid = versionTypes.Contains(Process.VersionType);
            }

            return isValid;
        }


        private void EnsureContextParamsAsync()
        {
            if (AuthorOnly)
            {
                DynamicScopedContextProvider.SetParameter(Omnia.Fx.Constants.Parameters.Apps.AppInstanceId, TeamAppId.ToString());
            }
            else
            {
                if (Process.VersionType == ProcessVersionType.Archived || Process.VersionType == ProcessVersionType.Published)
                {
                    DynamicScopedContextProvider.SetParameter(OPMConstants.Security.Parameters.SecurityResourceId, Process.SecurityResourceId.ToString());
                }

                DynamicScopedContextProvider.SetParameter(Omnia.Fx.Constants.Parameters.Apps.AppInstanceId, TeamAppId.ToString());
                DynamicScopedContextProvider.SetParameter(OPMConstants.Security.Parameters.OPMProcessId, Process.OPMProcessId.ToString());
            }

        }
    }
}
