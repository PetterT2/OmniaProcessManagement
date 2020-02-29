using Omnia.Fx.Models.EnterpriseProperties.EnterprisePropertyItemSettings;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class PropertySetItemSettingsValidation
    {
        internal static void Validate(PropertySetPersonItemSettings setPersonItemSettings, EnterprisePropertyPersonItemSettings setPersonItem)
        {
            if (!setPersonItem.AllowMultipleValues && setPersonItemSettings.FixedDefaultValues != null && setPersonItemSettings.FixedDefaultValues.Count > 1)
                throw new Exception("Invalid FixedDefaultValues, the property set does not support multiple values for this property");
        }

        internal static void Validate(PropertySetTaxonomyItemSettings setTaxonomyItemSettings, EnterprisePropertyTaxonomyItemSettings setTaxonomyItem)
        {
            if (!setTaxonomyItem.AllowMultipleValues && setTaxonomyItemSettings.FixedDefaultValues != null && setTaxonomyItemSettings.FixedDefaultValues.Count > 1)
                throw new Exception("Invalid FixedDefaultValues, the property set does not support multiple values for this property");
        }

        internal static T CleanModel<T>(PropertySetItemSettings setItemSettings) where T : PropertySetItemSettings, new()
        {
            var settings = setItemSettings.CastTo<PropertySetItemSettings, T>();
            if (settings.AdditionalProperties != null)
                settings.AdditionalProperties.Clear();

            return settings;
        }
    }
}
