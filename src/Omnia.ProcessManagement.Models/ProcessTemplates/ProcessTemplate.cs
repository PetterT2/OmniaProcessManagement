using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTemplates
{
    public class ProcessTemplate
    {
        public Guid Id { get; set; }
        public ProcessTemplateSettings Settings { get; set; }
    }
}
