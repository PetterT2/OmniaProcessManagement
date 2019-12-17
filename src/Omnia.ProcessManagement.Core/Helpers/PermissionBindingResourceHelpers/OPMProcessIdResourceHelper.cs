using Omnia.ProcessManagement.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Omnia.ProcessManagement.Core.PermissionBindingResourceHelpers
{
    public class OPMProcessIdResourceHelper
    {
        private static Regex Regex = new Regex($"^{OPMConstants.Security.Resources.OPMProcessIdResourcePrefix}[0-9a-fA-F]{{8}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{4}}-[0-9a-fA-F]{{12}}$", RegexOptions.IgnoreCase);
        public static string GenerateResource(Guid opmProcessId)
        {
            return $"{OPMConstants.Security.Resources.OPMProcessIdResourcePrefix}{opmProcessId}".ToLower();
        }

        public static bool TryParseOPMProcessId(string resource, out Guid opmProcessId)
        {
            opmProcessId = Guid.Empty;
            if (!Regex.IsMatch(resource)) return false;

            resource = resource.ToLower();
            resource = resource.Replace($"{OPMConstants.Security.Resources.OPMProcessIdResourcePrefix.ToLower()}", "");
            return Guid.TryParse(resource, out opmProcessId);
        }

        public static List<Guid> ParseOPMProcessIds(List<string> resources)
        {
            var opmProcessIds = new List<Guid>();

            foreach (var resource in resources)
            {
                if (TryParseOPMProcessId(resource, out Guid opmProcessId))
                {
                    opmProcessIds.Add(opmProcessId);
                }
            }

            opmProcessIds = opmProcessIds.Distinct().ToList();

            return opmProcessIds;
        }
    }
}
