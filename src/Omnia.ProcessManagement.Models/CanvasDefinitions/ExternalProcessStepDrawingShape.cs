using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class ExternalProcessStepDrawingShape : DrawingShape
    {
        public override DrawingShapeTypes Type => DrawingShapeTypes.ExternalProcessStep;
        public Guid ProcessStepId { get; set; }
    }
}
