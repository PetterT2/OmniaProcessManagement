using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class ExternalProcessDrawingShape : DrawingShape
    {
        public override DrawingShapeTypes Type => DrawingShapeTypes.ExternalProcess;
        public Guid OPMProcessId { get; set; }
    }
}
