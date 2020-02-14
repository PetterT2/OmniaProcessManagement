using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ShapeTemplates;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Shapes
{
    public class DrawingShapeDefinition : ShapeDefinition
    {
        public override ShapeDefinitionTypes Type => ShapeDefinitionTypes.Drawing;
        public Guid ShapeTemplateId { get; set; }
        public ShapeTemplateType ShapeTemplateType { get; set; }
        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
        public string TextColor { get; set; }
        public string HoverBackgroundColor { get; set; }
        public string HoverBorderColor { get; set; }
        public string HoverTextColor { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public TextPosition TextPosition { get; set; }
        public int FontSize { get; set; }
    }
}
