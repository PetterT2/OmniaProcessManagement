
using Newtonsoft.Json.Linq;
using Omnia.Fx.Caching;
using Omnia.Fx.Http;
using Omnia.ProcessManagement.Models.Graph;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Graph
{
    internal class GraphService : IGraphService
    {
        private static readonly string GraphApiSPListCacheKey = "GraphApiSPListCache";
        IOmniaCacheWithKeyHelper<IOmniaSynchronizedMemoryCache> CacheHelper { get; }
        IHttpClientService<Office365GraphApi> OmniaGraphService { get; }
        public GraphService(IHttpClientService<Office365GraphApi> omniaGraphService, IOmniaSynchronizedMemoryCache cache)
        {
            OmniaGraphService = omniaGraphService;
            CacheHelper = cache.AddKeyHelper(this);
        }

        public async ValueTask<GraphApiSPSite> GetSiteAsync(string hostName, string siteRelativeUrl)
        {
            // Try to get from cache
            var cacheKey = CacheHelper.CreateKey(CacheHelper.CreateKey("CDLSite", hostName.ToLower() + siteRelativeUrl.ToLower()));
            var cacheResult = await CacheHelper.Instance.GetOrSetDependencyCacheAsync(cacheKey, async (cacheEntry) =>
            {
                var httpResponse = await this.OmniaGraphService.GetAsync($"v1.0/sites/{hostName}:/{siteRelativeUrl}");
                if (httpResponse.IsSuccessStatusCode)
                {
                    var contentAsString = await httpResponse.Content.ReadAsStringAsync();
                    var contentAsObj = JObject.Parse(contentAsString);

                    GraphApiSPSite site = new GraphApiSPSite()
                    {
                        Id = (string)contentAsObj["id"],
                        DisplayName = (string)contentAsObj["displayName"],
                        Name = (string)contentAsObj["name"],
                        Description = (string)contentAsObj["description"],
                        CreatedDateTime = Convert.ToDateTime((string)contentAsObj["createdDateTime"]),
                        LastModifiedDateTime = Convert.ToDateTime((string)contentAsObj["lastModifiedDateTime"]),
                        WebUrl = (string)contentAsObj["webUrl"]
                    };

                    return site;
                }
                else
                {
                    string errorMessage = await GetErrorMessage(httpResponse);
                    throw new Exception(errorMessage);
                }
            });

            return cacheResult.Value;
        }

        public async ValueTask<GraphApiSPList> GetListByWebUrlAsync(string siteId, string webUrl)
        {
            // Try to get from cache
            var cacheKey = CacheHelper.CreateKey(CacheHelper.CreateKey(GraphApiSPListCacheKey, siteId.ToLower() + webUrl.ToLower()));
            var cacheResult = await CacheHelper.Instance.GetOrSetDependencyCacheAsync(cacheKey, async (cacheEntry) =>
            {
                var httpResponse = await this.OmniaGraphService.GetAsync($"v1.0/sites/{siteId}/lists?expand=contentTypes");
                if (httpResponse.IsSuccessStatusCode)
                {
                    var contentAsString = await httpResponse.Content.ReadAsStringAsync();
                    var contentAsObj = JObject.Parse(contentAsString);
                    var values = (JArray)contentAsObj.SelectToken("value");

                    var listObj = values.FirstOrDefault(x => ((string)x["webUrl"]).Contains(webUrl));
                    if (listObj != null)
                    {
                        return new GraphApiSPList()
                        {
                            Id = new Guid((string)listObj["id"]),
                            DisplayName = (string)listObj["displayName"],
                            Name = (string)listObj["name"],
                            WebUrl = (string)listObj["webUrl"],
                            Description = (string)listObj["description"],
                            CreatedDateTime = Convert.ToDateTime((string)listObj["createdDateTime"]),
                            LastModifiedDateTime = Convert.ToDateTime((string)listObj["lastModifiedDateTime"]),
                            ContentTypes = listObj != null ? listObj["contentTypes"].ToObject<List<SPContentType>>() : null
                        };
                    }

                    return null;
                }
                else
                {
                    string errorMessage = await GetErrorMessage(httpResponse);
                    throw new Exception(errorMessage);
                }
            });

            return cacheResult.Value;
        }

        public async ValueTask<GraphApiGetListItemsResponse> GetListItemsAsync(string siteId, Guid listId, List<string> selectedFieldsInternalName, string filterQuery,
            string orderByQuery, int itemLimit)
        {
            string requestUrl = $"v1.0/sites/{siteId}/lists/{listId}/items";
            List<string> customQueries = new List<string>();

            if (selectedFieldsInternalName != null && selectedFieldsInternalName.Count > 0)
            {
                var selectedFieldsQuery = String.Join(',', selectedFieldsInternalName);
                selectedFieldsQuery = string.Format("expand=fields(select={0})", selectedFieldsQuery);
                customQueries.Add(selectedFieldsQuery);
            }

            if (!string.IsNullOrEmpty(filterQuery)) customQueries.Add(filterQuery);
            if (!string.IsNullOrEmpty(orderByQuery)) customQueries.Add(orderByQuery);
            if (itemLimit > 0) customQueries.Add("top=" + itemLimit);

            if (customQueries.Count > 0)
            {
                string query = String.Join('&', customQueries);
                requestUrl += "?" + query;
            }

            return await GetListItemsAsync(requestUrl);
        }

        public async ValueTask<GraphApiGetListItemsResponse> GetListItemsAsync(string requestUrl)
        {
            GraphApiGetListItemsResponse result = new GraphApiGetListItemsResponse();
            NameValueCollection headers = new NameValueCollection();
            headers.Add("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly");

            var httpResponse = await this.OmniaGraphService.GetAsync(requestUrl, null, headers);
            if (httpResponse.IsSuccessStatusCode)
            {
                var contentAsString = await httpResponse.Content.ReadAsStringAsync();
                var contentAsObj = JObject.Parse(contentAsString);
                var values = (JArray)contentAsObj.SelectToken("value");
                result.NextLinkUrl = (string)contentAsObj["@odata.nextLink"];
                if (result.NextLinkUrl != null && result.NextLinkUrl.IndexOf("v1.0/sites") > 0)
                    result.NextLinkUrl = result.NextLinkUrl.Remove(0, result.NextLinkUrl.IndexOf("v1.0/sites") - 1);

                foreach (var x in values)
                {
                    var createdByUserObj = x["createdBy"] != null ? (JObject)x["createdBy"].SelectToken("user") : null;
                    var lastModifiedByObj = x["lastModifiedBy"] != null ? (JObject)x["lastModifiedBy"].SelectToken("user") : null;
                    var fieldsObj = (JObject)x["fields"];
                    GraphApiSPListItem item = new GraphApiSPListItem
                    {
                        Id = (int)x["id"],
                        WebUrl = (string)x["webUrl"],
                        Description = (string)x["description"],
                        CreatedDateTime = Convert.ToDateTime((string)x["createdDateTime"]),
                        LastModifiedDateTime = Convert.ToDateTime((string)x["lastModifiedDateTime"]),
                        CreatedBy = createdByUserObj != null ? new GraphApiSPUser
                        {
                            Id = createdByUserObj.SelectToken("id") != null ? new Guid((string)createdByUserObj.SelectToken("id")) : Guid.Empty,
                            DisplayName = createdByUserObj.SelectToken("displayName") != null ? (string)createdByUserObj.SelectToken("displayName") : "",
                            Email = createdByUserObj.SelectToken("email") != null ? (string)createdByUserObj.SelectToken("email") : ""
                        } : null,
                        LastModifiedBy = lastModifiedByObj != null ? new GraphApiSPUser
                        {
                            Id = lastModifiedByObj.SelectToken("id") != null ? new Guid((string)lastModifiedByObj.SelectToken("id")) : Guid.Empty,
                            DisplayName = lastModifiedByObj.SelectToken("displayName") != null ? (string)lastModifiedByObj.SelectToken("displayName") : "",
                            Email = lastModifiedByObj.SelectToken("email") != null ? (string)lastModifiedByObj.SelectToken("email") : ""
                        } : null,
                        Fields = fieldsObj != null ? fieldsObj.ToObject<Dictionary<string, object>>() : null
                    };

                    result.ListItems.Add(item);
                };

                return result;
            }
            else
            {
                string errorMessage = await GetErrorMessage(httpResponse);
                throw new Exception(errorMessage);
            }
        }

        private async ValueTask<string> GetErrorMessage(HttpResponseMessage httpResponse)
        {
            var contentAsString = await httpResponse.Content.ReadAsStringAsync();
            var contentAsObj = JObject.Parse(contentAsString);
            return (string)contentAsObj["error"]["message"];
        }
    }
}
