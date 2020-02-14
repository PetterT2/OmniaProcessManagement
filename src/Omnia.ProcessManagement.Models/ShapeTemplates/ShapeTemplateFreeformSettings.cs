using Omnia.ProcessManagement.Models.FabricShape;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeTemplates
{
    public class ShapeTemplateFreeformSettings : ShapeTemplateSettings
    {
        public List<FabricShapeData> Nodes { get; set; }
    }
}
