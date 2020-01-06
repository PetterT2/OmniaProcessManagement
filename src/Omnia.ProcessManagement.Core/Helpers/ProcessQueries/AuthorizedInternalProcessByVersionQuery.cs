using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    internal class AuthorizedInternalProcessByVersionQuery : BaseAuthorizedProcessByVersionQuery, IAuthorizedInternalProcessQuery
    {
        public AuthorizedInternalProcessByVersionQuery(DraftOrPublishedVersionType versionType, UserAuthorizedResource authorizedResource,
            List<Guid> limitedTeamAppIds = null, List<Guid> limitedOPMProcessIds = null)
            : base(versionType, authorizedResource, limitedTeamAppIds, limitedOPMProcessIds)
        {

        }

        protected override List<string> SelectColumns
        {
            get
            {
                return new List<string> {
                    nameof (Process.Id),
                    nameof (Process.OPMProcessId),
                    nameof (Process.ProcessWorkingStatus),
                    nameof (Process.SecurityResourceId),
                    nameof (Process.TeamAppId),
                    nameof (Process.VersionType),
                    nameof (Process.CheckedOutBy)
                };
            }
        }
    }
}
