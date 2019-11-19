using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class CanvasDefinition
    {
        public string BackgroundImageUrl { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int GridX { get; set; }
        public int GridY { get; set; }
        public List<DrawingShapeNode> Shapes { get; set; }
    }
}
