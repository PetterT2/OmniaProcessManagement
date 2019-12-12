using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class Link
    {
        public Guid Id { get; set; }
        public MultilingualString Title { get; set; }
        public string Url { get; set; }
        public bool OpenNewWindow { get; set; }
    }
}
