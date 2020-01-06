

using Omnia.ProcessManagement.Models.Images;

namespace Omnia.ProcessManagement.Core.Helpers.ProcessQueries
{
    public interface IAuthorizedImageReferenceQuery
    {
        string GetQuery();
        ImageReference ImageRef { get; }
    }
}
