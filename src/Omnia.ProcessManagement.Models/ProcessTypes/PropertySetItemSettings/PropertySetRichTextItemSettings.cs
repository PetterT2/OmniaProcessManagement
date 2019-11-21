using Omnia.Fx.Models.EnterpriseProperties;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetRichTextItemSettings : PropertySetItemSettings
    {
        public override PropertyIndexedType Type
        {
            get
            {
                return PropertyIndexedType.RichText;
            }
        }

        public string FixedDefaultValue { get; set; }
    }
}
