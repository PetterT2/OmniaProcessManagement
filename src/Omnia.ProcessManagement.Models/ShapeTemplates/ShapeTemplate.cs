using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeTemplates
{
    public class ShapeTemplate
    {
        public ShapeTemplate()
        {
            Id = Guid.NewGuid();
        }
        public Guid Id { get; set; }
        public MultilingualString Title { get; set; }
        public bool BuiltIn { get; set; }
        public ShapeTemplateSettings Settings { get; set; }
    }
}
