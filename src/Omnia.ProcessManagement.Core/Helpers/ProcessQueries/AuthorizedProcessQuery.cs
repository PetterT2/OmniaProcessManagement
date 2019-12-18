using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.Repositories;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public class AuthorizedProcessQuery
    {
        private static readonly string ProcessTableName = nameof(OmniaPMDbContext.Processes);
        private List<Guid> LimitedTeamAppIds = new List<Guid>();
        private List<Guid> LimitedOPMProcessIds = new List<Guid>();
        private SecurityTrimmingHelper.VersionTypeSupportTrimming VersionType { get; }
        private UserAuthorizedResource AuthorizedResource { get; }
        public AuthorizedProcessQuery(SecurityTrimmingHelper.VersionTypeSupportTrimming versionType, UserAuthorizedResource authorizedResource)
        {
            VersionType = versionType;
            AuthorizedResource = authorizedResource;
        }

        public void SetLimitedTeamAppIds(params Guid[] teamAppIds)
        {
            LimitedTeamAppIds.AddRange(teamAppIds);
            LimitedTeamAppIds = LimitedTeamAppIds.Distinct().ToList();
        }

        public void SetLimitedOPMProcessIds(params Guid[] opmProcessIds)
        {
            LimitedOPMProcessIds.AddRange(opmProcessIds);
            LimitedOPMProcessIds = LimitedTeamAppIds.Distinct().ToList();
        }

        public virtual string GetQuery()
        {
            var securityTrimming = SecurityTrimmingHelper.GenerateSecurityTrimming(AuthorizedResource, VersionType, LimitedTeamAppIds, LimitedOPMProcessIds);

            if (securityTrimming == string.Empty)
            {
                return "";
            }

            var query = new StringBuilder();
            var alias = SecurityTrimmingHelper.ProcessTableAlias;
            var nameStr = string.Join(", ", SelectColumns.Select(column => $"{alias}.[{column}]"));

            query.Append($"SELECT {nameStr} FROM [{ProcessTableName}] as {alias} ");
            query.Append($"WHERE {securityTrimming}");
            return query.ToString(); ;
        }

        protected virtual List<string> SelectColumns
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

        internal AuthorizedInternalProcessQuery ConvertToAuthorizedInternalProcessQuery()
        {
            var internalProcessQuery = new AuthorizedInternalProcessQuery(VersionType, AuthorizedResource);
            internalProcessQuery.SetLimitedOPMProcessIds(LimitedOPMProcessIds.ToArray());
            internalProcessQuery.SetLimitedTeamAppIds(LimitedTeamAppIds.ToArray());

            return internalProcessQuery;
        }
    }
}
