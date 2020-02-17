using Omnia.ProcessManagement.Models.FabricShape;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeDefinitions
{
    public class DrawingFreeformShapeDefinition : DrawingShapeDefinition
    {
        public List<FabricShapeData> Nodes { get; set; }
    }
}
