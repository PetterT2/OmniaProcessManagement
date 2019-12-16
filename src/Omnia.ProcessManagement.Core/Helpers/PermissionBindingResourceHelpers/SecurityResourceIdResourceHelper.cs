using Omnia.ProcessManagement.Core;
using System;
using System.Text.RegularExpressions;

namespace Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers
{
    public class SecurityResourceIdResourceHelper
    {
        private static Regex Regex = new Regex($"^{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix}[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}}(_[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}})?$", RegexOptions.IgnoreCase);
        public static string GenerateResource(string securityResourceId)
        {
            return $"{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix}{securityResourceId}".ToLower();
        }

        public static bool TryParseSecurityResourceId(string resource, out string securityResourceId)
        {
            securityResourceId = "";
            if (!Regex.IsMatch(resource)) return false;

            resource = resource.ToLower();
            resource = resource.Replace($"{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix.ToLower()}", "");
            securityResourceId = resource;

            return true;
        }
    }
}
