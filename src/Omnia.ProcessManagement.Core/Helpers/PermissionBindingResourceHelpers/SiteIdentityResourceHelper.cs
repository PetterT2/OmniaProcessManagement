using Omnia.ProcessManagement.Core;
using System;
using System.Text.RegularExpressions;

namespace Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers
{
    public class SiteIdentityResourceHelper
    {
        private static Regex Regex = new Regex($"^{OPMConstants.Security.Resources.SiteIdentityResourcePrefix}[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}}_[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}}$", RegexOptions.IgnoreCase);
        public static string GenerateResource(Guid siteId, Guid webId)
        {
            return $"{OPMConstants.Security.Resources.SiteIdentityResourcePrefix}{siteId}_{webId}".ToLower();
        }

        public static bool TryParseSiteIdentity(string resource, out Guid siteId, out Guid webId)
        {
            siteId = Guid.Empty;
            webId = Guid.Empty;

            if (!Regex.IsMatch(resource)) return false;

            resource = resource.ToLower();
            resource = resource.Replace($"{OPMConstants.Security.Resources.SiteIdentityResourcePrefix.ToLower()}", "");
            var ids = resource.Split('_');

            siteId = Guid.Parse(ids[0]);
            webId = Guid.Parse(ids[1]);

            return true;
        }
    }
}
