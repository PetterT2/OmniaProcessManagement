using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Messaging;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core
{
    public static class OPMConstants
    {
        public static class RequestedOmniaResources
        {
            public static Guid SqlDBUniqueId => new Guid("dec4dab9-2ab3-4720-9cee-d00da62a507f");
        }

        public static class Messaging
        {
            public static class Topics
            {
                public static readonly Topic<Dictionary<string, string>> OmniaTokenKeyUpdatedDocumentType = new Topic<Dictionary<string, string>>("OmniaProcessManagement", "UpdateUserOmniaTokenKeyInWorker");
                public static readonly Topic<List<ProcessType>> OnProcessTypesUpdated = new Topic<List<ProcessType>>("OmniaProcessManagement", "OnProcessTypesUpdated");
                public static readonly Topic<StringBuilder> OnSettingsUpdated = new Topic<StringBuilder>("OmniaProcessManagement", "OnSettingsUpdated");
            }
        }

        public static class Features
        {
            public static class OPMDefaultProperties
            {
                public static IList<EnterprisePropertyDefinition> Properties => new List<EnterprisePropertyDefinition>()
                    {
                        ProcessType
                    };
                public static EnterprisePropertyDefinition ProcessType
                {
                    get
                    {
                        return new EnterprisePropertyDefinition()
                        {
                            Id = new Guid("3c067d03-876b-4dd0-9355-ff3373712964"),
                            InternalName = SharePoint.OPMFields.Fields_ProcessType,
                            OmniaSearchable = false,
                            Title = new MultilingualString()
                            {
                                [LanguageTag.EnUs] = "Process Type"
                            },
                            EnterprisePropertyDataTypeId = Omnia.Fx.Constants.EnterprisePropertyDataTypes.Taxonomy.Id,
                            Settings = null,
                            SPSearchable = false,
                            ManagedPropertySettings = null,
                            BuiltIn = true
                        };
                    }
                }
            }
        }

        public static class SharePoint
        {
            public static class OPMFields
            {
                public const string Fields_ProcessType = "OPMProcessType";
            }
        }
    }
}
