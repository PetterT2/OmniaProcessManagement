using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Models.Manifests.ServerSide;
using Omnia.Fx.Security;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnia.WebContentManagement.Web.Security.ResourceEvaluators
{
    public interface ISecurityResourceIdResourceEvaluator : IRoleResourceEvaluator
    {
    }

    internal class SecurityResourceIdResourceEvaluator : BaseResourceEvaluator, ISecurityResourceIdResourceEvaluator
    {

        public SecurityResourceIdResourceEvaluator(IScopedContextResolver scopedContextResolver)
            : base(scopedContextResolver)
        {
        }

        public override async ValueTask<string> GetRoleResourceAsync()
        {
            var context = ScopedContextResolver.GetParamValues(OPMConstants.Security.Parameters.SecurityResourceId);
            return await GetRoleResourceWithContextAsync(context);
        }

        protected override Dictionary<string, ServiceParamTypes> GetParamInfo()
        {
            return new Dictionary<string, ServiceParamTypes>
            {
                { OPMConstants.Security.Parameters.SecurityResourceId, ServiceParamTypes.String }
            };
        }

        protected override ValueTask<string> GetRoleResourceWithContextAsync(Dictionary<string, string> context)
        {
            string result = null;
            var securityResourceId = context.GetContextParamValue<string>(OPMConstants.Security.Parameters.SecurityResourceId);
            if (!string.IsNullOrWhiteSpace(securityResourceId))
            {
                result = SecurityResourceIdResourceHelper.GenerateResource(securityResourceId);
            }
            return new ValueTask<string>(result);
        }
    }
}
