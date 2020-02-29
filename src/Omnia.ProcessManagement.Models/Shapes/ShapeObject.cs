using Omnia.ProcessManagement.Models.FabricShape;
using Omnia.ProcessManagement.Models.ShapeDefinitions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Shapes
{
    public class ShapeObject
    {
        public string ShapeTemplateTypeName { get; set; }
        public List<FabricShapeData> Nodes { get; set; }
        public DrawingShapeDefinitionProperties Definition { get; set; }
        public double Left { get; set; }
        public double Top { get; set; }
    }
}
