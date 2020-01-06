using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    internal class AuthorizedProcessByVersionQuery : BaseAuthorizedProcessByVersionQuery, IAuthorizedProcessQuery
    {
        public AuthorizedProcessByVersionQuery(DraftOrPublishedVersionType versionType, UserAuthorizedResource authorizedResource,
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
                    nameof (Process.JsonValue),
                    nameof (Process.TeamAppId),
                    nameof (Process.VersionType),
                    nameof (Process.CheckedOutBy),
                    nameof (Process.CreatedAt),
                    nameof (Process.ModifiedAt),
                    nameof (Process.CreatedBy),
                    nameof (Process.ModifiedBy)
                };
            }
        }

        IAuthorizedInternalProcessQuery IAuthorizedProcessQuery.ConvertToAuthorizedInternalProcessQuery()
        {
            var internalProcessQuery = new AuthorizedInternalProcessByVersionQuery(VersionType, AuthorizedResource, LimitedTeamAppIds, LimitedOPMProcessIds);
            return internalProcessQuery;
        }
    }
}
