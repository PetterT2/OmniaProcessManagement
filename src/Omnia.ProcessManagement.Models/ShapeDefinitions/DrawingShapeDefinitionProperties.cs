using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.FabricShape;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeDefinitions
{
    // 
    public class DrawingShapeDefinitionProperties
    {
        public Guid ShapeTemplateId { get; set; }
        public ShapeTemplateType ShapeTemplateType { get; set; }
        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
        public string TextColor { get; set; }
        public string HoverBackgroundColor { get; set; }
        public string HoverBorderColor { get; set; }
        public string HoverTextColor { get; set; }
        public string SelectedBackgroundColor { get; set; }
        public string SelectedBorderColor { get; set; }
        public string SelectedTextColor { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public TextPosition TextPosition { get; set; }
        public string TextAlignment { get; set; }
        public int TextHorizontalAdjustment { get; set; }
        public int TextVerticalAdjustment { get; set; }
        public int FontSize { get; set; }
        public string ImageUrl { get; set; }
        public List<FabricShapeData> Nodes { get; set; }
        public double ArrowWidthPercent { get; set; }
        public double ArrowHeightPercent { get; set; }
        public double RoundX { get; set; }
        public double RoundY { get; set; }
    }
}
