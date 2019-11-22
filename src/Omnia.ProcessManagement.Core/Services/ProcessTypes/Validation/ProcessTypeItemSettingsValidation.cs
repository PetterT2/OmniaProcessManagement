using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.Fx.Models.EnterprisePropertySets.PropertySetItem;
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
                    var alternativeInternalNameDict = new Dictionary<string, bool>();
                    var keys = processTypeItemSettings.PropertySetItemSettings.Keys.ToList();
                    foreach (var key in keys)
                    {
                        var propertySetItemSettings = processTypeItemSettings.PropertySetItemSettings[key];
                        var propertySetItem = set.Settings.Items.FirstOrDefault(i => i.EnterprisePropertyDefinitionId == key);
                        var appProperty = properties.FirstOrDefault(p => p.Id == propertySetItemSettings.DefaultValueFromAppPropertyDefinitionId);

                        if (!string.IsNullOrWhiteSpace(propertySetItemSettings.AlternativeInternalName))
                        {
                            propertySetItemSettings.AlternativeInternalName = propertySetItemSettings.AlternativeInternalName.Trim();
                            if (alternativeInternalNameDict.ContainsKey(propertySetItemSettings.AlternativeInternalName))
                                throw new Exception("ProcessTypeItemSettings.AlternativeInternalName is invalid, there are duplicated alternative internal names");
                            alternativeInternalNameDict.Add(propertySetItemSettings.AlternativeInternalName, true);
                        }

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
                            set.Settings.Items.FirstOrDefault(i => i.EnterprisePropertyDefinitionId == id && i.Type == PropertyIndexedType.Person) : null;
                        if (personPropertyDefinition == null)
                            throw new Exception("Invalid FeedbackRecipientsPropertyDefinitionIds, there is invalid property definition for using as recipients");
                    }
                }
            }
        }


        private static PropertySetItemSettings ValidateSetItemSettings(EnterprisePropertySetItem setItem, PropertySetItemSettings setItemSettings, EnterprisePropertyDefinition appPropertyDefinition)
        {
            if (setItem == null || setItemSettings == null || setItemSettings.Type != setItem.Type)
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

            if (setItem.Type == PropertyIndexedType.Person)
            {
                var personSetItem = setItem.Cast<EnterprisePropertySetItem, PropertySetPersonItem>();
                var personSetItemSettigns = PropertySetItemSettingsValidation.CleanModel<PropertySetPersonItemSettings>(setItemSettings);

                setItemSettings = personSetItemSettigns;
                PropertySetItemSettingsValidation.Validate(personSetItemSettigns, personSetItem);
            }
            else if (setItem.Type == PropertyIndexedType.Taxonomy)
            {
                var taxonomySetItem = setItem.Cast<EnterprisePropertySetItem, PropertySetTaxonomyItem>();
                var taxonomySetItemSettigns = PropertySetItemSettingsValidation.CleanModel<PropertySetTaxonomyItemSettings>(setItemSettings);

                setItemSettings = taxonomySetItemSettigns;
                PropertySetItemSettingsValidation.Validate(taxonomySetItemSettigns, taxonomySetItem);
            }
            else if (setItem.Type == PropertyIndexedType.Boolean)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetBooleanItemSettings>(setItemSettings);
            }
            else if (setItem.Type == PropertyIndexedType.Text)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetTextItemSettings>(setItemSettings);
            }
            else if (setItem.Type == PropertyIndexedType.RichText)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetRichTextItemSettings>(setItemSettings);
            }
            else if (setItem.Type == PropertyIndexedType.DateTime)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetDateTimeItemSettings>(setItemSettings);
            }
            else if (setItem.Type == PropertyIndexedType.Number)
            {
                setItemSettings = PropertySetItemSettingsValidation.CleanModel<PropertySetNumberItemSettings>(setItemSettings);
            }

            return setItemSettings;
        }
    }
}
