using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public abstract class BaseAuthorizedProcessByVersionQuery
    {
        protected List<Guid> LimitedTeamAppIds = new List<Guid>();
        protected List<Guid> LimitedOPMProcessIds = new List<Guid>();
        protected DraftOrPublishedVersionType VersionType { get; }
        protected UserAuthorizedResource AuthorizedResource { get; }
        public BaseAuthorizedProcessByVersionQuery(DraftOrPublishedVersionType versionType, UserAuthorizedResource authorizedResource)
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
            var tableName = SecurityTrimmingHelper.ProcessTableName;
            var nameStr = string.Join(", ", SelectColumns.Select(column => $"{alias}.[{column}]"));

            query.Append($"SELECT {nameStr} FROM [{tableName}] as {alias} ");
            query.Append($"WHERE {securityTrimming}");
            return query.ToString(); ;
        }

        protected abstract List<string> SelectColumns { get; }
    }
}
