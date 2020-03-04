using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.FabricShape;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeDefinitions
{
    // 
    public class DrawingRectShapeDefinitionProperties : DrawingShapeDefinition
    {
        public double RoundX { get; set; }
        public double RoundY { get; set; }
    }
}
