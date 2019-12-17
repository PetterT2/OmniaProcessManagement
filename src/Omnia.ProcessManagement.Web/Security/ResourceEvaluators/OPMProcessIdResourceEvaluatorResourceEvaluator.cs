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
    public interface IOPMProcessIdResourceEvaluatorResourceEvaluator : IRoleResourceEvaluator
    {
    }

    internal class OPMProcessIdResourceEvaluatorResourceEvaluator : BaseResourceEvaluator, IOPMProcessIdResourceEvaluatorResourceEvaluator
    {

        public OPMProcessIdResourceEvaluatorResourceEvaluator(IScopedContextResolver scopedContextResolver)
            : base(scopedContextResolver)
        {
        }

        public override async ValueTask<string> GetRoleResourceAsync()
        {
            var context = ScopedContextResolver.GetParamValues(OPMConstants.Security.Parameters.OPMProcessId);
            return await GetRoleResourceWithContextAsync(context);
        }

        protected override Dictionary<string, ServiceParamTypes> GetParamInfo()
        {
            return new Dictionary<string, ServiceParamTypes>
            {
                { OPMConstants.Security.Parameters.OPMProcessId, ServiceParamTypes.Guid }
            };
        }

        protected override ValueTask<string> GetRoleResourceWithContextAsync(Dictionary<string, string> context)
        {
            string result = null;
            var opmProcessIdParamKey = OPMConstants.Security.Parameters.OPMProcessId.ToLower();
            if (context.ContainsKey(opmProcessIdParamKey) && Guid.TryParse(context[opmProcessIdParamKey], out Guid opmProcessId))
            {

                result = OPMProcessIdResourceHelper.GenerateResource(opmProcessId);

            }
            return new ValueTask<string>(result);
        }
    }
}
