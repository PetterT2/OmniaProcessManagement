
using Omnia.ProcessManagement.Models.Graph;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Graph
{
    public interface IGraphService
    {
        ValueTask<GraphApiSPSite> GetSiteAsync(string hostName, string siteRelativeUrl);
        ValueTask<GraphApiSPList> GetListByWebUrlAsync(string siteId, string webUrl);
        ValueTask<GraphApiGetListItemsResponse> GetListItemsAsync(string siteId, Guid listId, List<string> selectedFieldsInternalName, string filterQuery, string orderByQuery, int itemLimit);
        ValueTask<GraphApiGetListItemsResponse> GetListItemsAsync(string requestUrl);
    }
}
