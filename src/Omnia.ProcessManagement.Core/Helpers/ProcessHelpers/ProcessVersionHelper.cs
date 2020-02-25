using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.Processes
{
    public class ProcessVersionHelper
    {
        internal static (int, int, int) GetEditionRevisionAndOPMProcessIdNumber(Dictionary<string, JToken> processEnterpriseProperties)
        {
            if (processEnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Edition.InternalName, out JToken editionJToken) &&
                processEnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Revision.InternalName, out JToken revisionJToken) &&
                int.TryParse(editionJToken.ToString(), out int edition) &&
                int.TryParse(revisionJToken.ToString(), out int revision))
            {
                int opmProcessIdNumber = 0;
                if (processEnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.OPMProcessIdNumber.InternalName, out JToken opmProcessIdNumberJToken) && opmProcessIdNumberJToken != null)
                {
                    int.TryParse(opmProcessIdNumberJToken.ToString(), out opmProcessIdNumber);
                }

                return (edition, revision, opmProcessIdNumber);
            }
            else
            {
                throw new Exception("Invalid edition or revision");
            }
        }

    }
}
