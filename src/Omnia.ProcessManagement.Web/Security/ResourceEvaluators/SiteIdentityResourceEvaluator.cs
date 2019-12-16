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
    public interface ISiteIdentityResourceEvaluator : IRoleResourceEvaluator
    {
    }

    internal class SiteIdentityResourceEvaluator : BaseResourceEvaluator, ISiteIdentityResourceEvaluator
    {

        public SiteIdentityResourceEvaluator(IScopedContextResolver scopedContextResolver)
            : base(scopedContextResolver)
        {
        }

        public override async ValueTask<string> GetRoleResourceAsync()
        {
            var context = ScopedContextResolver.GetParamValues(OPMConstants.Security.Parameters.SiteId, OPMConstants.Security.Parameters.WebId);
            return await GetRoleResourceWithContextAsync(context);
        }

        protected override Dictionary<string, ServiceParamTypes> GetParamInfo()
        {
            return new Dictionary<string, ServiceParamTypes>
            {
                { OPMConstants.Security.Parameters.SiteId, ServiceParamTypes.Guid },
                { OPMConstants.Security.Parameters.WebId, ServiceParamTypes.Guid }
            };
        }

        protected override ValueTask<string> GetRoleResourceWithContextAsync(Dictionary<string, string> context)
        {
            string result = null;
            var siteIdParamKey = OPMConstants.Security.Parameters.SiteId.ToLower();
            var webIdParamKey = OPMConstants.Security.Parameters.WebId.ToLower();
            if (context.ContainsKey(siteIdParamKey) && context.ContainsKey(webIdParamKey))
            {
                if (Guid.TryParse(context[siteIdParamKey], out Guid siteId) && Guid.TryParse(context[webIdParamKey], out Guid webId))
                {
                    result = SiteIdentityResourceHelper.GenerateResource(siteId, webId);
                }
            }
            return new ValueTask<string>(result);
        }
    }
}
