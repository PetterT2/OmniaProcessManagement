using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.SharePointTasks
{
    public class CSOMSharePointTaskResponse
    {
        public string NextPageString { get; set; }
        public string PreviousPageString { get; set; }
        public List<SharePointTask> Tasks { get; set; }
        public CSOMSharePointTaskResponse()
        {
            Tasks = new List<SharePointTask>();
        }
    }
}
