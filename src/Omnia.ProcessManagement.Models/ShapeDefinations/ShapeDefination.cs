using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Shapes
{
    public class ShapeDefination : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public enum ShapeDefinationTypes
        {
            Undefined = 0,
            Heading = 1,
            Drawing = 2,
        }

        public virtual ShapeDefinationTypes Type { get; set; } = ShapeDefinationTypes.Undefined;

        public MultilingualString Title { get; set; }
    }
}
