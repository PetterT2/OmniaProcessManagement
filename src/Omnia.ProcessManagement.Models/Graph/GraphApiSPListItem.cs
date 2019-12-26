using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Graph
{
    public class GraphApiSPListItem : GraphApiSPItem
    {
        public int Id { get; set; }
        public GraphApiSPUser CreatedBy { get; set; }
        public GraphApiSPUser LastModifiedBy { get; set; }
        public Dictionary<string, object> Fields { get; set; }
    }
}
