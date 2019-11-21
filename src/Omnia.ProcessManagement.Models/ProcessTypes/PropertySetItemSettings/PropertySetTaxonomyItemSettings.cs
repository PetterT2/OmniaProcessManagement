using Omnia.Fx.Models.EnterpriseProperties;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetTaxonomyItemSettings : PropertySetItemSettings
    {
        public override PropertyIndexedType Type
        {
            get
            {
                return PropertyIndexedType.Taxonomy;
            }
        }

        public List<Guid> FixedDefaultValues { get; set; }
    }
}
