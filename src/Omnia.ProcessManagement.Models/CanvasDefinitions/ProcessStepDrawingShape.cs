using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class ProcessStepDrawingShape : DrawingShape
    {
        public override DrawingShapeTypes Type => DrawingShapeTypes.ProcessStep;
        public Guid ProcessStepId { get; set; }
    }
}
