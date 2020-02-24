using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class UndefinedDrawingShape : DrawingShape
    {
        public override DrawingShapeTypes Type => DrawingShapeTypes.Undefined;
    }
}
