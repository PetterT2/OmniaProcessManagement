using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.SharePointTasks
{
    public class SharePointTaskRequest
    {
        public string WebUrl { get; set; }
        public string PagingInfo { get; set; }
        public int RowPerPage { get; set; }
        public string SortBy { get; set; }
        public bool SortAsc { get; set; }
        public string QueryText { get; set; }
        public TaskViewType ViewMode { get; set; }
        public int SPItemId { get; set; }
        public int CurrentPage { get; set; }
    }
}
