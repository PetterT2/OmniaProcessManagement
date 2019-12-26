using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Graph
{
    public class GraphApiGetListItemsResponse
    {
        public string NextLinkUrl { get; set; }
        public List<GraphApiSPListItem> ListItems { get; set; }

        public GraphApiGetListItemsResponse()
        {
            NextLinkUrl = "";
            ListItems = new List<GraphApiSPListItem>();
        }
    }
}
