using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessContent
    {
        public Guid Id { get; set; }
        public LanguageTag LanguageTag { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
    }
}
