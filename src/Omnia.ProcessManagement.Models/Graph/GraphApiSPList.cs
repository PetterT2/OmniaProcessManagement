using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Graph
{
    public class GraphApiSPList : GraphApiSPItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public List<SPContentType> ContentTypes { get; set; }
    }
}
