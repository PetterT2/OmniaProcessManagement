using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeDefinitions
{
    public class ShapeTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public MultilingualString Title { get; set; }
    }
}
