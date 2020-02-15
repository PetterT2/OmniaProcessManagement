using Omnia.ProcessManagement.Models.FabricShape;
using Omnia.ProcessManagement.Models.Shapes;
using System;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public enum DrawingShapeTypes
    {
        Undefined = 0,
        ProcessStep = 1,
        CustomLink = 2,
        ExternalProcess = 3
    }

    public class DrawingShape : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public Guid Id { get; set; }

        public virtual DrawingShapeTypes Type { get; set; }

        public ShapeObject Shape { get; set; } //TODO - Do we need to have server-side model for this data ?!
    }
}
