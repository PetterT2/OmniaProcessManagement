using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTemplates
{
    public class ProcessTemplateSettings
    {
        public MultilingualString Title { get; set; }
        public List<ShapeDefinition> ShapeDefinitions { get; set; }
    }
}
