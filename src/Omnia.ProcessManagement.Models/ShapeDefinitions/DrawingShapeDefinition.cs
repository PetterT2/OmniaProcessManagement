using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Shapes
{
    public class DrawingShapeDefinition : ShapeDefinition
    {
        public override ShapeDefinitionTypes Type => ShapeDefinitionTypes.Drawing;

        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
        public string TextColor { get; set; }
        public string ActiveBackgroundColor { get; set; }
        public string ActiveBorderColor { get; set; }
        public string ActiveTextColor { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public TextPosition TextPosition { get; set; }
        public int FontSize { get; set; }
    }
}
