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
        public int Left { get; set; }
        public int Top { get; set; }
    }
}
