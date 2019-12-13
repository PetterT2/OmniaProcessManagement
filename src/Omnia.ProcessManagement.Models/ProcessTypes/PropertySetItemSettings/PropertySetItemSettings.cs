using Omnia.Fx.Models.EnterpriseProperties;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetItemSettings : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        /// <summary>
        /// Note: there are three types Data, Media, EnterpriseKeyworkds are not supported, it will be throw exception in validation
        /// </summary>
        public virtual PropertyIndexedType Type { get; set; }

        public Guid? DefaultValueFromAppPropertyDefinitionId { get; set; }

    }
}
