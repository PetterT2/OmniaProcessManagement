using Omnia.Fx.Models.EnterpriseProperties;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetBooleanItemSettings : PropertySetItemSettings
    {
        public override PropertyIndexedType Type
        {
            get
            {
                return PropertyIndexedType.Boolean;
            }
        }

        public bool FixedDefaultValue { get; set; }
    }
}
