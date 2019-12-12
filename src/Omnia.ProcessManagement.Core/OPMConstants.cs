using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Messaging;
using Omnia.ProcessManagement.Models.ProcessTypes;
using Omnia.Fx.Utilities;
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
                public static readonly Topic<Dictionary<string, string>> OmniaTokenKeyUpdatedProcessType = new Topic<Dictionary<string, string>>("OmniaProcessManagement", "UpdateUserOmniaTokenKeyInWorker");
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

            public static class ProcessLibrary
            {
                public const string IdAsString = "73dcb5d4-b359-471c-ad8e-1e66c2f36bbd";
                public static readonly Guid IdAsGuid = new Guid(IdAsString);
            }
        }

        public static class SharePoint
        {
            public static class ListUrl
            {
                public const string PublishList = "OPMPublishedProcesss";
                public const string TaskList = "OPMTasks";
            }

            public static class OPMFields
            {
                public const string Fields_ProcessType = "OPMProcessType";
                public const string Fields_ProcessId = "OPMProcessId";
                public const string Fields_Edition = "OPMEdition";
                public const string Fields_Revision = "OPMRevision";
                public const string Fields_Properties = "OPMProperties";
                public const string Fields_TaskOutcome = "OPMTaskOutcome";
                public const string Fields_Comment = "OPMComment";
            }

            public static class SharePointFields
            {
                public const string ContentTypeId = "ContentTypeId";
                public const string Title = "Title";
                public const string ClientSideApplicationId = "ClientSideApplicationId";
                public const string PageLayoutType = "PageLayoutType";
                public const string PromotedState = "PromotedState";
                public const string CanvasContent1 = "CanvasContent1";
            }
        }

        public static class OPMPages
        {
            public const string ProcessLibraryPageName = "Processes.aspx";
            public const string SitePages = "SitePages";
            public const string SitePagesFeatureId = "b6917cb1-93a0-4b97-a84d-7cf49975d4ec";
            public const string ModernHomePage = "0x0101009D1CB255DA76424F860D91F20E6C4118";
            public const string SingleWebPartAppPageLayoutType = "SingleWebPartAppPage";
        }

        public static class ModerPageTemplate
        {
            public const string Canvas = "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;webPartId&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;{0}&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1.0,&quot;zoneIndex&quot;&#58;1.0,&quot;sectionIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12&#125;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;instanceId&quot;&#58;&quot;{1}&quot;,&quot;title&quot;&#58;&quot;Omnia Block&quot;,&quot;description&quot;&#58;&quot;Add Omnia Block&quot;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;omniaControlSettings&quot;&#58;&quot;&#123;\\&quot;componentTag\\&quot;&#58; \\&quot;{2}\\&quot;,\\&quot;componentSettings\\&quot;&#58; {3}&#125;&quot;&#125;&#125;\"><div data-sp-componentid=\"\">637fc62f-9aa4-43bb-a885-189460b9cdde</div><div data-sp-htmlproperties=\"\"></div></div></div></div>";
            public const string CanvasSettings = "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;webPartId&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;{0}&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1.0,&quot;zoneIndex&quot;&#58;1.0,&quot;sectionIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12&#125;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;instanceId&quot;&#58;&quot;{1}&quot;,&quot;title&quot;&#58;&quot;Omnia Block&quot;,&quot;description&quot;&#58;&quot;Add Omnia Block&quot;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;omniaControlSettings&quot;&#58;&quot;&#123;\\&quot;componentTag\\&quot;&#58; \\&quot;{2}\\&quot;,\\&quot;componentSettings\\&quot;&#58;&#123;\\&quot;settings\\&quot;&#58;&#123;\\&quot;searchScope\\&quot;&#58;2&#125;&#125;&#125;&quot;&#125;&#125;\"><div data-sp-componentid=\"\">637fc62f-9aa4-43bb-a885-189460b9cdde</div><div data-sp-htmlproperties=\"\"></div></div></div></div>";
            public const string ProcessLibraryComponent = "opm-process-library";
        }

        public static class LocalizedTextKeys
        {
            public static readonly string ProcessLibraryQuickLauchName = CommonUtils.GetLocalizedText("OPM.Core.Features.ProcessLibrary.Title");
            public static readonly string ContentTypeGroupName = CommonUtils.GetLocalizedText("OPM.Core.Features.ContentTypes.GroupName");
            public static readonly string FieldGroupName = CommonUtils.GetLocalizedText("OPM.Core.Features.Fields.GroupName");
        }

        public static class ProcessColumns
        {
            public const string Title = "Title";
        }
    }
}
