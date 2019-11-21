using Omnia.Fx.Models.EnterpriseProperties;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetDateTimeItemSettings : PropertySetItemSettings
    {
        public override PropertyIndexedType Type
        {
            get
            {
                return PropertyIndexedType.DateTime;
            }
        }

        public DateTime? FixedDefaultValue { get; set; }
    }
}
