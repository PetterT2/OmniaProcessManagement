using Newtonsoft.Json.Linq;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.FabricShape
{
    public class FabricShapeData
    {
        public FabricShapeDataType FabricShapeDataType { get; set; }
        public Dictionary<string, JToken> Properties { get; set; }
    }
}
