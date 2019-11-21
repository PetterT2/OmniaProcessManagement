using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings
{
    public class PropertySetPersonItemSettings : PropertySetItemSettings
    {
        public override PropertyIndexedType Type
        {
            get
            {
                return PropertyIndexedType.Person;
            }
        }

        public List<UserIdentity> FixedDefaultValues { get; set; }
    }
}
