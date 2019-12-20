using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
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
        public LinkType LinkType { get; set; }
        public bool OpenNewWindow { get; set; }
    }
}
