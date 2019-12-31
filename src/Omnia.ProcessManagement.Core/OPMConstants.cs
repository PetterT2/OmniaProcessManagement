using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Messaging;
using Omnia.ProcessManagement.Models.ProcessTypes;
using Omnia.Fx.Utilities;
using System;
using System.Collections.Generic;
using System.Text;
using Omnia.ProcessManagement.Models.Enums;

namespace Omnia.ProcessManagement.Core
{
    public static class OPMConstants
    {
        [Obsolete("Wait for TeamCollaboration's fx, pay attention to replace it as soon as possible")]
        public static Guid TeamCollaborationAppDefinitionId = new Guid("d2240d7b-af3c-428c-bae8-5b8bfc08e3ac");

        public static class RequestedOmniaResources
        {
            public static Guid SqlDBUniqueId => new Guid("dec4dab9-2ab3-4720-9cee-d00da62a507f");
        }

        public readonly static string ImageTempFolder = "OPMTempImages";

        public static class Messaging
        {
            public static class Topics
            {
                public static readonly Topic<List<ProcessWorkingStatus>> OnProcessWorkingStatusUpdated = new Topic<List<ProcessWorkingStatus>>("OmniaProcessManagement", "OnProcessWorkingStatusUpdated");
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
                        ProcessType, Revision, Edition
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

                public static EnterprisePropertyDefinition Revision
                {
                    get
                    {
                        return new EnterprisePropertyDefinition()
                        {
                            Id = new Guid("59e47e4f-561c-4f97-985f-ec843b0d922b"),
                            InternalName = SharePoint.OPMFields.Fields_Revision,
                            OmniaSearchable = false,
                            Title = new MultilingualString()
                            {
                                [LanguageTag.EnUs] = "Revision"
                            },
                            EnterprisePropertyDataTypeId = Omnia.Fx.Constants.EnterprisePropertyDataTypes.Number.Id,
                            Settings = null,
                            SPSearchable = false,
                            ManagedPropertySettings = null,
                            BuiltIn = true
                        };
                    }
                }

                public static EnterprisePropertyDefinition Edition
                {
                    get
                    {
                        return new EnterprisePropertyDefinition()
                        {
                            Id = new Guid("d5128e77-3056-40a9-94c4-f1251a60690a"),
                            InternalName = SharePoint.OPMFields.Fields_Edition,
                            OmniaSearchable = false,
                            Title = new MultilingualString()
                            {
                                [LanguageTag.EnUs] = "Edition"
                            },
                            EnterprisePropertyDataTypeId = Omnia.Fx.Constants.EnterprisePropertyDataTypes.Number.Id,
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

            public static class ArchiveProcess
            {
                public const string IdAsString = "2c5a48d7-7fc6-44a2-827f-ddbd99ef9c5e";
                public static readonly Guid IdAsGuid = new Guid(IdAsString);
            }
        }

        public static class SharePoint
        {
            public static class CamlQueryString
            {
                public const string ScopeRecursive = "Scope='Recursive'";
            }

            public static class SharepointType
            {
                public const string Text = "Text";
                public const string Boolean = "Boolean";
                public const string Integer = "Integer";
                public const string DateTime = "DateTime";
                public const string File = "File";
                public const string Note = "Note";
                public const string User = "User";
                public const string UserId = "UserId";
                public const string Number = "Number";
                public const string UserMulti = "UserMulti";
                public const string String = "String";
                public const string TaxonomyFieldType = "TaxonomyFieldType";
                public const string TaxonomyFieldTypeMulti = "TaxonomyFieldTypeMulti";
                public const string Counter = "Counter";
            }
            public static class ListUrl
            {
                public const string PublishList = "OPMPublishedProcesses";
                public const string TaskList = "OPMTasks";
                public const string ArchivedList = "OPMArchivedProcesses";
            }

            public static class FolderUrl
            {
                public const string Images = "Images";
            }

            public static class OPMFields
            {
                public const string Fields_ProcessType = "OPMProcessType";
                public const string Fields_ProcessId = "OPMProcessId";
                public const string Fields_Edition = "OPMEdition";
                public const string Fields_Revision = "OPMRevision";
                public const string Fields_ProcessData = "OPMProcessData";
                public const string Fields_TaskOutcome = "OPMTaskOutcome";
                public const string Fields_Comment = "OPMComment";
            }

            public static class TaskStatus
            {
                public const string Completed = "Completed";
                public const string Cancel = "Cancel";
            }

            public static class SharePointFields
            {
                public const string ContentTypeId = "ContentTypeId";
                public const string Title = "Title";
                public const string ClientSideApplicationId = "ClientSideApplicationId";
                public const string PageLayoutType = "PageLayoutType";
                public const string PromotedState = "PromotedState";
                public const string CanvasContent1 = "CanvasContent1";

                public const string Fields_DueDate = "DueDate";
                public const string Fields_StartDate = "StartDate";
                public const string Fields_Status = "Status";
                public const string Fields_Assigned_To = "AssignedTo";
                public const string Fields_PercentComplete = "PercentComplete";
                public const string Fields_Author = "Author";
                public const string Fields_ID = "ID";
                public const string Fields_Title = "Title";
                public const string Fields_Author_LookupId = "AuthorLookupId";
                public const string Fields_Editor = "Editor";
                public const string Fields_Assigned_To_LookupId = "AssignedToLookupId";
                public const string Fields_Predecessors = "Predecessors";
                public const string Fields_TaskDescription = "Body";
                public const string Fields_FileLeafRef = "FileLeafRef";
            }
        }

        public static class OPMPages
        {
            public const string ProcessLibraryPageName = "Processes.aspx";
            public const string SitePages = "SitePages";
            public const string SitePagesFeatureId = "b6917cb1-93a0-4b97-a84d-7cf49975d4ec";
            public const string ModernHomePage = "0x0101009D1CB255DA76424F860D91F20E6C4118";
            public const string SingleWebPartAppPageLayoutType = "SingleWebPartAppPage";

            public const string ApprovalTaskUrl = "{0}/SitePages/Processes.aspx?displaytab=tasks&taskid={1}&viewtasktype=1";
            public const string ProcessPreviewUrl = "{0}/SitePages/Processes.aspx/?displaytab=drafts/#/@pm/preview/g/{1}";
        }

        public static class ModerPageTemplate
        {
            public const string Canvas = "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;webPartId&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;{0}&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1.0,&quot;zoneIndex&quot;&#58;1.0,&quot;sectionIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12&#125;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;instanceId&quot;&#58;&quot;{1}&quot;,&quot;title&quot;&#58;&quot;Omnia Block&quot;,&quot;description&quot;&#58;&quot;Add Omnia Block&quot;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;omniaControlSettings&quot;&#58;&quot;&#123;\\&quot;componentTag\\&quot;&#58; \\&quot;{2}\\&quot;,\\&quot;componentSettings\\&quot;&#58; {3}&#125;&quot;&#125;&#125;\"><div data-sp-componentid=\"\">637fc62f-9aa4-43bb-a885-189460b9cdde</div><div data-sp-htmlproperties=\"\"></div></div></div></div>";
            public const string CanvasSettings = "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;webPartId&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;{0}&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1.0,&quot;zoneIndex&quot;&#58;1.0,&quot;sectionIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12&#125;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;637fc62f-9aa4-43bb-a885-189460b9cdde&quot;,&quot;instanceId&quot;&#58;&quot;{1}&quot;,&quot;title&quot;&#58;&quot;Omnia Block&quot;,&quot;description&quot;&#58;&quot;Add Omnia Block&quot;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;omniaControlSettings&quot;&#58;&quot;&#123;\\&quot;componentTag\\&quot;&#58; \\&quot;{2}\\&quot;,\\&quot;componentSettings\\&quot;&#58;&#123;\\&quot;settings\\&quot;&#58;&#123;\\&quot;searchScope\\&quot;&#58;2&#125;&#125;&#125;&quot;&#125;&#125;\"><div data-sp-componentid=\"\">637fc62f-9aa4-43bb-a885-189460b9cdde</div><div data-sp-htmlproperties=\"\"></div></div></div></div>";
            public const string ProcessLibraryComponent = "opm-process-library";
        }

        public static class TemporaryGroupPrefixes
        {
            public const string ReviewsGroup = "Temporary Process Reviewers ";
            public const string ApproversGroup = "Temporary Process Approvers ";
        }


        public static class LocalizedTextKeys
        {
            public static readonly string AuthorsGroupSuffix = CommonUtils.GetLocalizedText("OPM.Core.Features.SharePointGroups.AuthorGroupSuffix");
            public static readonly string ReadersGroupSuffix = CommonUtils.GetLocalizedText("OPM.Core.Features.SharePointGroups.ReaderGroupSuffix");
            public static readonly string ProcessLibraryQuickLauchName = CommonUtils.GetLocalizedText("OPM.Core.Features.ProcessLibrary.Title");
            public static readonly string ContentTypeGroupName = CommonUtils.GetLocalizedText("OPM.Core.Features.ContentTypes.GroupName");
            public static readonly string FieldGroupName = CommonUtils.GetLocalizedText("OPM.Core.Features.Fields.GroupName");
            public static readonly string ApprovalTaskTitlePrefix = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.TaskTitle.ApprovalTaskPrefix");
        }

        public static class OPMContentTypeId
        {
            public const string CTApprovalTaskStringId = "0x010048629609AA6E4577B841268AA6AFDA0F";
        }

        public static class EmailTemplates
        {
            public static class CompleteApproval
            {
                public static readonly string ApproveSubjectLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CompleteApproval.ApproveSubjectLocalizedKey");
                public static readonly string ApproveBodyLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CompleteApproval.ApproveBodyLocalizedKey");
                public static readonly string ApproveBodyNoCommentLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CompleteApproval.ApproveBodyNoCommentLocalizedKey");

                public static readonly string RejectSubjectLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CompleteApproval.RejectSubjectLocalizedKey");
                public static readonly string RejectBodyLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CompleteApproval.RejectBodyLocalizedKey");

                public static class Tokens
                {
                    public static readonly string ApproverName = "ApproverName";
                    public static readonly string AuthorName = "AuthorName";
                    public static readonly string ProcessTitle = "ProcessTitle";
                    public static readonly string ApproverComment = "ApproverComment";
                }
            }

            public static class SendForApproval
            {
                public static readonly string SubjectLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.SendForApproval.SubjectTemplate");
                public static readonly string BodyLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.SendForApproval.BodyTemplate");
                public static readonly string AuthorEditionCommentLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.SendForApproval.BodyTemplate");

                public static class Tokens
                {
                    public static readonly string ApproverName = "ApproverName";
                    public static readonly string AuthorName = "AuthorName";
                    public static readonly string ProcessTitle = "ProcessTitle";
                    public static readonly string ProcessLink = "ProcessLink";
                    public static readonly string DueDate = "DueDate";
                    public static readonly string TaskTitle = "TaskTitle";
                    public static readonly string TaskLink = "TaskLink";
                    public static readonly string StartDate = "StartDate";
                    public static readonly string Message = "Message";
                }
            }

            public static class CancelApproval
            {
                public static readonly string SubjectLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CancelApproval.SubjectTemplate");
                public static readonly string BodyLocalizedKey = CommonUtils.GetLocalizedText("OPM.ProcessLibrary.EmailTemplates.CancelApproval.BodyTemplate");

                public static class Tokens
                {
                    public static readonly string ApproverName = "ApproverName";
                    public static readonly string ProcessTitle = "ProcessTitle";
                }
            }

        }


        public static class Security
        {
            public static class Parameters
            {
                public const string OPMProcessId = "opmProcessId";
                public const string SecurityResourceId = "opmSecurityResourceId";
            }

            public static class Resources
            {
                public const string OPMProcessIdResourcePrefix = "opmprocessid_";
                public const string SecurityResourceIdResourcePrefix = "opmsecurityresourceid_";
            }

            public static class Roles
            {
                public const string Author = "f412d0be-16e8-4fc2-80cf-dca39a265a08";
                public const string Reader = "38c86dbf-44a2-45c4-b370-2c1cabea954c";
                public const string Approver = "22672fb9-e62f-470c-a68d-77ae03a5115d";
                public const string Reviewer = "89e89b72-a75c-41d2-8303-b83800980faa";
            }
        }
    }
}
