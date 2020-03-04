using Omnia.ProcessManagement.Models.FabricShape;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeTemplates
{
    public class ShapeTemplatePentagonSettings : ShapeTemplateSettings
    {
        public double ArrowWidthPercent { get; set; }
        public double ArrowHeightPercent { get; set; }
        public bool IsLine { get; set; }
    }
}
