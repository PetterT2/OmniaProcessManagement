using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.EnterpriseProperties.EnterprisePropertyItemSettings;
using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessTypes;
using Omnia.ProcessManagement.Models.ProcessTypes.PropertySetItemSettings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class ProcessTypeItemSettingsValidation
    {
        internal static void Validate(ProcessTypeItemSettings processTypeItemSettings,
            List<EnterprisePropertyDefinition> properties, EnterprisePropertySet set)
        {
            if (set == null)
                throw new Exception("ProcessTypeItemSettings.EnterprisePropertySetId is invalid");

            if (processTypeItemSettings.PropertySetItemSettings != null && processTypeItemSettings.PropertySetItemSettings.Count > 0)
            {
                if (set.Settings.Items != null)
                {
                    var keys = processTypeItemSettings.PropertySetItemSettings.Keys.ToList();
                    foreach (var key in keys)
                    {
                        var propertySetItemSettings = processTypeItemSettings.PropertySetItemSettings[key];
                        var propertySetItem = set.Settings.Items.FirstOrDefault(i => i.Id == key);
                        var appProperty = properties.FirstOrDefault(p => p.Id == propertySetItemSettings.DefaultValueFromAppPropertyDefinitionId);

                        propertySetItemSettings = ValidateSetItemSettings(propertySetItem, propertySetItemSettings, appProperty);
                        processTypeItemSettings.PropertySetItemSettings[key] = propertySetItemSettings;
                    }
                }
                else
                {
                    throw new Exception("ProcessTypeItemSettings.PropertySetItemSettings is invalid, settings does not match with property set");
                }
            }

            if (processTypeItemSettings.ReviewReminder != null)
            {
                ReviewReminderValidation.Validate(processTypeItemSettings.ReviewReminder, set);
            }

            if (processTypeItemSettings.FeedbackRecipientsPropertyDefinitionIds != null && processTypeItemSettings.FeedbackRecipientsPropertyDefinitionIds.Count > 0)
            {
                foreach (var id in processTypeItemSettings.FeedbackRecipientsPropertyDefinitionIds)
                {
                    if (id != ProcessTypeItemSettings.ApproverGroupId)
                    {
                        var personPropertyDefinition = set.Settings.Items != null ?
                            set.Settings.Items.FirstOrDefault(i => i.Id == id && i.Type == PropertyIndexedType.Person) : null;
                        if (personPropertyDefinition == null)
                            throw new Exception("Invalid FeedbackRecipientsPropertyDefinitionIds, there is invalid property definition for using as recipients");
                    }
                }
            }
        }


        private static PropertySetItemSettings ValidateSetItemSettings(EnterprisePropertyItemSettings propertyItemSettings, PropertySetItemSettings setItemSettings, EnterprisePropertyDefinition appPropertyDefinition)
        {
            if (propertyItemSettings == null || setItemSettings == null || setItemSettings.Type != propertyItemSettings.Type)
            {
                throw new Exception("ProcessTypeItemSettings.PropertySetItemSettings is invalid, settings does not match with property set");
            }

            if (setItemSettings.Type == PropertyIndexedType.Data ||
                setItemSettings.Type == PropertyIndexedType.EnterpriseKeywords ||
                setItemSettings.Type == PropertyIndexedType.Media)
            {
                throw new Exception("PropertySetItemSettings.Type is unsupported");
            }

            if (setItemSettings.DefaultValueFromAppPropertyDefinitionId.HasValue && (
                appPropertyDefinition == null ||
                appPropertyDefinition.EnterprisePropertyDataType == null ||
                appPropertyDefinition.EnterprisePropertyDataType.IndexedType != setItemSettings.Type))
            {
                throw new Exception("PropertySetItemSettings.DefaultValueFromAppPropertyId is invalid, it does not match with process type's type");
            }

            if (propertyItemSettings.Type == PropertyIndexedType.Person)
            {
                var personSetItem = propertyItemSettings.CastTo<EnterprisePropertyItemSettings, EnterprisePropertyPersonItemSettings>();
                var personSetItemSettigns = PropertySetItemSettingsValidation.CleanModel<PropertySetPersonItemSettings>(setItemSettings);

                setItemSettings = personSetItemSettigns;
                PropertySetItemSettingsValidation.Validate(personSetItemSettigns, personSetItem);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.Taxonomy)
            {
                var taxonomySetItem = propertyItemSettings.CastTo<EnterprisePropertyItemSettings, EnterprisePropertyTaxonomyItemSettings>();
                var taxonomySetItemSettigns = PropertySetItemSettingsValidation.CleanModel<PropertySetTaxonomyItemSettings>(setItemSettings);

                setItemSettings = taxonomySetItemSettigns;
                PropertySetItemSettingsValidation.Validate(taxonomySetItemSettigns, taxonomySetItem);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.Boolean)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetBooleanItemSettings>(setItemSettings);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.Text)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetTextItemSettings>(setItemSettings);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.RichText)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetRichTextItemSettings>(setItemSettings);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.DateTime)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetDateTimeItemSettings>(setItemSettings);
            }
            else if (propertyItemSettings.Type == PropertyIndexedType.Number)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetNumberItemSettings>(setItemSettings);
            }

            return setItemSettings;
        }
    }
}
