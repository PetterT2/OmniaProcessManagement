using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class CustomLinkDrawingShape : DrawingShape
    {
        public override DrawingShapeTypes Type => DrawingShapeTypes.CustomLink;
        public string Link { get; set; }
    }
}
