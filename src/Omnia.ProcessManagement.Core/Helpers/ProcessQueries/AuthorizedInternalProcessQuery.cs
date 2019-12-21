using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    internal class AuthorizedInternalProcessQuery : AuthorizedProcessQuery
    {
        public AuthorizedInternalProcessQuery(DraftOrLatestPublishedVersionType versionType, UserAuthorizedResource authorizedResource)
            : base(versionType, authorizedResource)
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
