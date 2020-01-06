namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public interface IAuthorizedProcessQuery
    {
        string GetQuery();
        internal IAuthorizedInternalProcessQuery ConvertToAuthorizedInternalProcessQuery();
    }
}
