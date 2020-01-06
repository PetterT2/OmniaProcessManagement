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
    public class AuthorizedProcessByProcessStepIdQuery : IAuthorizedProcessQuery
    {
        private Guid ProcessStepId { get; }
        private UserAuthorizedResource AuthorizedResource { get; }
        private IOmniaContext OmniaContext { get; }
        public AuthorizedProcessByProcessStepIdQuery(Guid processStepId, UserAuthorizedResource authorizedResource, IOmniaContext omniaContext)
        {
            ProcessStepId = processStepId;
            AuthorizedResource = authorizedResource;
            OmniaContext = omniaContext;
        }
        public string GetQuery()
        {
            var securityTrimming = SecurityTrimmingHelper.GenerateSecurityTrimming(AuthorizedResource, OmniaContext, null);

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
            query.Append($"WHERE {processDataTableAlias}.{nameof(ProcessData.ProcessStepId)} = '{ProcessStepId}' AND ({securityTrimming})");
            return query.ToString(); ;
        }

        IAuthorizedInternalProcessQuery IAuthorizedProcessQuery.ConvertToAuthorizedInternalProcessQuery()
        {
            //Not support this
            throw new NotSupportedException();
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
