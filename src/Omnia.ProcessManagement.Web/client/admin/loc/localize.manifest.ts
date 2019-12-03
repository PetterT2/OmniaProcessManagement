import { Composer } from '@omnia/tooling/composers';
import { OPMAdminLocalization } from "./localize";

Composer.registerManifest("8394a64b-0f90-464a-b0f6-4c4f07cddbe2")
    .registerLocalization()
    .namespace(OPMAdminLocalization.namespace)
    .add<OPMAdminLocalization.locInterface>({
        ProcessManagement: "Process Management",
        Settings: "Settings",
        ArchiveSiteUrl: "Archive Site Url",
        ProcessTypes: {
            Title: "Process Types",
            UniqueId: "Unique Id",
            CreateProcessType: "Create Process Type",
            SyncJob: {
                SyncProcessTypeToTermSet: "Sync Document Types to Term Set",
                SyncProcessTypeFromTermSet: "Sync Document Types from Term Set",
                SyncProcessTypeFromTermSetMessage: "There is no any document types, do you want to sync data from mapped Term Set?",
                WaitingForSyncing: "waiting for syncing...",
                WarningTermStoreWorkingLanguageNotMatchMessageWithDetails: "The below language(s) could not be synced to SharePoint. Please add it to term store's working language and retry.",
                WarningTermStoreWorkingLanguageNotMatchMessage: "Some languages were not be asynced to SharePoint. Please retry.",
                SyncSuccessful: "Sync successful.",
                SyncFailed: "Sync failed.",
                Sync: "Sync",
                Hours: "hours",
                Minutes: "minutes",
                Seconds: "seconds",
                Retry: "Retry",
            },
            Settings: {
                Tabs: {
                    General: "General",
                    Publish: "Publish",
                    Review: "Review",
                    Archive: "Archive"
                },
                DefaultProcessTemplate: "Default Process Template",
                ChangePropertySetHint: "Please re-visit other related settings after changing a property set",
                PropertySet: "Property Set",
                PublishingApprovalTypes: {
                    Anyone: "Anyone",
                    LimitedUsers: "Limited list of users",
                    TermDriven: "Term-driven",
                    PersonProperty: "Based on person property",
                },
                AllowRevisions: "Allow Revisions",
                AllowBypassApprovalForRevisions: "Allow to bypass approval for Revisions",
                PublishingApproval: "Publishing Approval",
                TimePeriodTypes: {
                    Days: "Days",
                    Months: "Months",
                    Years: "Years"
                },
                TaskExpireIn: "Task expire in",
                Approver: "Approver",
                SendReminderInAdvance: "Send reminder in advance",
                ReviewReminderRecipients: "Review Reminder Recipients",
                CreateTask: "Create Task",
                ReviewReminderScheduleTypes: {
                    TimeAfterPublishing: "Time after publishing",
                    Property: "Property"
                },
                FeedbackRecipients: "Feedback Recipients",
                ReviewReminder: "Review Reminder",
                ArchiveSiteUrlHint: "Leave it empty to use default archive site url",
            },
            Messages: {
                ProcessTypesTermSetNotFound: "Term Set for Process Types is not found"
            }
        },
        ProcessTemplates: {
            Title: "Process Templates",
            SettingsTabs: {
                General: "General",
                Shapes: "Shapes",
                DefaultContent: "Default Content"
            },
            CreateProcessTemplate: "Create Process Template",
            AddHeading: "Add Heading",
            AddShape: "Add Shape",
            ShapeSettings: {
                TextColor: "Text Color",
                ActiveBackgroundColor: "Active Background Color",
                ActiveBorderColor: "Active Border Color",
                ActiveTextColor: "Active Text Color",
                Width: "Width",
                Height: "Height",
                TextPosition: "Text Position",
                FontSize: "Font Size",
                Above: "Above",
                Center: "Center",
                Below: "Below"
            },
            Messages: {
                NoProcessTemplate: "There's no process template.",
                NoShapeTemplate: "There's no shape template."
            }
        }
    });