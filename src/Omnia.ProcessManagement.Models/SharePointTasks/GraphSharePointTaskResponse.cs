using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.SharePointTasks
{
    public class GraphSharePointTaskResponse
    {
        public string NextLinkUrl { get; set; }
        public List<SharePointTask> Tasks { get; set; }

        public GraphSharePointTaskResponse()
        {
            NextLinkUrl = "";
            Tasks = new List<SharePointTask>();
        }
    }
}
