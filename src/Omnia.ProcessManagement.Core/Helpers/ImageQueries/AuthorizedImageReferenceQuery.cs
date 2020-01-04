using Omnia.Fx.Contexts;
using Omnia.ProcessManagement.Core.Entities.Images;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.Repositories;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public class AuthorizedImageReferenceQuery
    {
        private UserAuthorizedResource AuthorizedResource { get; }
        public Models.Images.ImageReference ImageRef { get; private set; }
        private IOmniaContext OmniaContext { get; }

        private Guid OPMProcessId { get; }
        public AuthorizedImageReferenceQuery(UserAuthorizedResource authorizedResource, Models.Images.ImageReference imageRef, Guid opmProcessId, IOmniaContext omniaContext)
        {
            ImageRef = imageRef;
            OPMProcessId = opmProcessId;
            AuthorizedResource = authorizedResource;
            OmniaContext = omniaContext;
        }


        public virtual string GetQuery()
        {
            var securityTrimming = SecurityTrimmingHelper.GenerateSecurityTrimming(AuthorizedResource, OPMProcessId, OmniaContext);

            if (securityTrimming == string.Empty)
            {
                return "";
            }

            var query = new StringBuilder();
            var processTableAlias = SecurityTrimmingHelper.ProcessTableAlias;
            var processTableName = SecurityTrimmingHelper.ProcessTableName;

            var imageTableAlias = SecurityTrimmingHelper.ImageReferenceTableAlias;
            var imageTableName = SecurityTrimmingHelper.ImageReferenceTableName;

            var nameStr = string.Join(", ", Columns.Select(column => $"{imageTableAlias}.[{column}]"));

            var imageRefQuery = $" AND {imageTableAlias}.{nameof(Entities.Images.ImageReference.FileName)} = '{ImageRef.FileName}' AND {imageTableAlias}.{nameof(Entities.Images.ImageReference.ImageId)} = '{ImageRef.ImageId}'";

            query.Append($"SELECT TOP (1) {nameStr} FROM [{imageTableName}] {imageTableAlias} LEFT JOIN [{processTableName}] {processTableAlias} ON {imageTableAlias}.{nameof(Entities.Images.ImageReference.ProcessId)} = {processTableAlias}.{nameof(Process.Id)}");
            query.Append($" WHERE {securityTrimming}{imageRefQuery}");
            return query.ToString(); ;
        }

        private List<string> Columns
        {
            get
            {
                return new List<string> {
                    nameof (Entities.Images.ImageReference.ProcessId),
                    nameof (Entities.Images.ImageReference.FileName),
                    nameof (Entities.Images.ImageReference.ImageId)
                };
            }
        }
    }
}
