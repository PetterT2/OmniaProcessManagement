using Omnia.ProcessManagement.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers
{
    public class SecurityResourceIdResourceHelper
    {
        private static Regex Regex = new Regex($"^{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix}[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}}(_[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}})?$", RegexOptions.IgnoreCase);
        public static string GenerateResource(Guid securityResourceId)
        {
            return $"{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix}{securityResourceId}".ToLower();
        }

        public static bool TryParseSecurityResourceId(string resource, out Guid securityResourceId)
        {
            securityResourceId = Guid.Empty;
            if (!Regex.IsMatch(resource)) return false;

            resource = resource.ToLower();
            resource = resource.Replace($"{OPMConstants.Security.Resources.SecurityResourceIdResourcePrefix.ToLower()}", "");
            return Guid.TryParse(resource, out securityResourceId);
        }

        public static List<Guid> ParseSecurityResourceIds(List<string> resources)
        {
            var securityResourceIds = new List<Guid>();

            foreach (var resource in resources)
            {
                if (TryParseSecurityResourceId(resource, out Guid securityResourceId))
                {
                    securityResourceIds.Add(securityResourceId);
                }
            }

            securityResourceIds = securityResourceIds.Distinct().ToList();

            return securityResourceIds;
        }
    }
}
