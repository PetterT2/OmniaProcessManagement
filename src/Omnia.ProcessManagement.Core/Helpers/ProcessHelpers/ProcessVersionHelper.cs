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
        internal static (int, int) GetEditionAndRevision(Entities.Processes.Process process)
        {
            var processEnterpriseProperties = JsonConvert.DeserializeObject<Dictionary<string, JToken>>(process.EnterpriseProperties);

            if (processEnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Edition.InternalName, out JToken editionJToken) &&
                processEnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Revision.InternalName, out JToken revisionJToken) &&
                int.TryParse(editionJToken.ToString(), out int edition) &&
                int.TryParse(revisionJToken.ToString(), out int revision))
            {
                return (edition, revision);
            }
            else
            {
                throw new Exception("Invalid edition or revision");
            }
        }

        public static (int, int) GetEditionAndRevision(Process process)
        {

            if (process.RootProcessStep != null && process.RootProcessStep.EnterpriseProperties != null &&
                process.RootProcessStep.EnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Edition.InternalName, out JToken editionJToken) &&
                process.RootProcessStep.EnterpriseProperties.TryGetValue(OPMConstants.Features.OPMDefaultProperties.Revision.InternalName, out JToken revisionJToken) &&
                int.TryParse(editionJToken.ToString(), out int edition) &&
                int.TryParse(revisionJToken.ToString(), out int revision))
            {
                return (edition, revision);
            }
            else
            {
                throw new Exception("Invalid edition or revision");
            }
        }

    }
}
