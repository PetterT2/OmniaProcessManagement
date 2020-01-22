using System;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public interface IAuthorizedProcessQuery
    {
        bool IsReviewer(Guid opmProcessId);
        bool IsAuthor(Guid teamAppId);
        string GetQuery();
        internal IAuthorizedInternalProcessQuery ConvertToAuthorizedInternalProcessQuery();
    }
}
