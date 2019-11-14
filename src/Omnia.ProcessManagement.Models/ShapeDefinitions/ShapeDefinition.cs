using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Shapes
{
    public class ShapeDefinition : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public enum ShapeDefinitionTypes
        {
            Undefined = 0,
            Heading = 1,
            Drawing = 2,
        }

        public virtual ShapeDefinitionTypes Type { get; set; } = ShapeDefinitionTypes.Undefined;

        public MultilingualString Title { get; set; }
    }
}
