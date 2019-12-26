using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Graph
{
    public class GraphApiSPItem
    {
        public string Description { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime? LastModifiedDateTime { get; set; }
        public string WebUrl { get; set; }
    }
}
