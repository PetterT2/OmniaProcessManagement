using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class MultilingualProcessContentRef : Dictionary<LanguageTag, MultilingualProcessContent>
    {

    }

    public class MultilingualProcessContent
    {
        public string Title { get; set; }
        public Guid ProcessContentId { get; set; }
    }
}
