using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessLibrary
{
    public class ProcessLibraryRequest
    {
        public string WebUrl { get; set; }
        public Dictionary<string, List<string>> Filters { get; set; }
        public string SortBy { get; set; }
        public bool SortAsc { get; set; }
        public int PageNum { get; set; }
        public int PageSize { get; set; }
    }
}
