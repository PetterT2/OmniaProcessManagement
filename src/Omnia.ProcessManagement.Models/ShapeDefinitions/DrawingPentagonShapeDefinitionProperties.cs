using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.FabricShape;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeDefinitions
{
    // 
    public class DrawingPentagonShapeDefinitionProperties : DrawingShapeDefinition
    {
        public double ArrowWidthPercent { get; set; }
        public double ArrowHeightPercent { get; set; }
    }
}
