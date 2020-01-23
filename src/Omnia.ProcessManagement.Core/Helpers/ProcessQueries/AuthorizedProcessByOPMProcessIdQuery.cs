using Omnia.Fx.Contexts;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    internal class AuthorizedProcessByOPMProcessIdQuery : IAuthorizedProcessQuery
    {
        private Guid OPMProcessId { get; }
        private UserAuthorizedResource AuthorizedResource { get; }
        private IOmniaContext OmniaContext { get; }

        private bool IncludeCheckedOutByOther { get; }
        public AuthorizedProcessByOPMProcessIdQuery(Guid opmProcessId, UserAuthorizedResource authorizedResource, IOmniaContext omniaContext, bool includeCheckedOutByOther)
        {
            OPMProcessId = opmProcessId;
            AuthorizedResource = authorizedResource;
            OmniaContext = omniaContext;
            IncludeCheckedOutByOther = includeCheckedOutByOther;
        }
        public string GetQuery()
        {
            var securityTrimming = SecurityTrimmingHelper.GenerateSecurityTrimming(AuthorizedResource, OmniaContext, OPMProcessId, IncludeCheckedOutByOther);

            if (securityTrimming == string.Empty)
            {
                return "";
            }

            var query = new StringBuilder();
            var processTableAlias = SecurityTrimmingHelper.ProcessTableAlias;
            var processTableName = SecurityTrimmingHelper.ProcessTableName;

            var processDataTableAlias = SecurityTrimmingHelper.ProcessDataTableAlias;
            var processDataTableName = SecurityTrimmingHelper.ProcessDataTableName;

            var nameStr = string.Join(", ", SelectColumns.Select(column => $"{processTableAlias}.[{column}]"));

            query.Append($"SELECT {nameStr} FROM [{processTableName}] as {processTableAlias} LEFT JOIN [{processDataTableName}] as {processDataTableAlias} ON {processTableAlias}.{nameof(Process.Id)} = {processDataTableAlias}.{nameof(ProcessData.ProcessId)} ");
            query.Append($"WHERE {securityTrimming}");
            return query.ToString(); ;
        }

        IAuthorizedInternalProcessQuery IAuthorizedProcessQuery.ConvertToAuthorizedInternalProcessQuery()
        {
            //Not support this
            throw new NotSupportedException();
        }

        public bool IsReviewer(Guid opmProcessId)
        {
            return AuthorizedResource.ReviewerOPMProcessIds.Contains(opmProcessId);
        }

        public bool IsAuthor(Guid teamAppId)
        {
            return AuthorizedResource.AuthorTeamAppIds.Contains(teamAppId);
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
    }
}
