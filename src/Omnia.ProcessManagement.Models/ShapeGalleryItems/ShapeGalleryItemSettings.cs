using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeGalleryItems
{
    public class ShapeGalleryItemSettings : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public MultilingualString Title { get; set; }
        public DrawingShapeDefinition ShapeDefinition { get; set; }
    }
}
