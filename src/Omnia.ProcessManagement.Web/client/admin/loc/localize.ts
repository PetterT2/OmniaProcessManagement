export module OPMAdminLocalization {
    export const namespace = "OPM.Admin";
    export interface locInterface {
        ProcessManagement: string,
        Settings: string,
        ArchiveSiteUrl: string,
        ProcessTypes: {
            Title: string,
            UniqueId: string,
            CreateProcessType: string,
            SyncJob: {
                SyncProcessTypeToTermSet: string,
                SyncProcessTypeFromTermSet: string,
                SyncProcessTypeFromTermSetMessage: string,
                WaitingForSyncing: string,
                WarningTermStoreWorkingLanguageNotMatchMessageWithDetails: string,
                WarningTermStoreWorkingLanguageNotMatchMessage: string,
                SyncSuccessful: string,
                SyncFailed: string,
                Sync: string,
                Hours: string,
                Minutes: string,
                Seconds: string,
                Retry: string,
            },
            Settings: {
                Tabs: {
                    General: string,
                    Publish: string,
                    Review: string,
                    Archive: string
                },
                DefaultProcessTemplate: string,
                ChangePropertySetHint: string,
                PropertySet: string,
                PublishingApprovalTypes: {
                    Anyone: string,
                    LimitedUsers: string,
                    TermDriven: string,
                    PersonProperty: string
                },
                AllowRevisions: string,
                AllowBypassApprovalForRevisions: string,
                PublishingApproval: string,
                TimePeriodTypes: {
                    Days: string,
                    Months: string,
                    Years: string
                },
                TaskExpireIn: string,
                Approver: string,
                SendReminderInAdvance: string,
                ReviewReminderRecipients: string,
                CreateTask: string,
                ReviewReminderScheduleTypes: {
                    TimeAfterPublishing: string,
                    Property: string
                },
                FeedbackRecipients: string,
                ReviewReminder: string,
                ArchiveSiteUrlHint: string,
                DefaultValueTypes: {
                    FixedValue: string,
                    FromSiteProperty: string
                },
                AlternativeInternalName: string,
                DefaultValue: string,
                InheritParentSettings: string,
                NoApproverFound: string,
            },
            Messages: {
                ProcessTypesTermSetNotFound: string
            }
        },
        ProcessTemplates: {
            Title: string,
            SettingsTabs: {
                General: string,
                Shapes: string,
                DefaultContent: string
            },
            CreateProcessTemplate: string,
            AddHeading: string,
            AddShape: string,
            ShapeSettings: {
                TextColor: string,
                ActiveBackgroundColor: string,
                ActiveBorderColor: string,
                ActiveTextColor: string,
                Width: string,
                Height: string,
                TextPosition: string,
                FontSize: string,
                Above: string,
                Center: string,
                Below: string
            },
            Messages: {
                NoProcessTemplate: string,
                NoShapeTemplate: string
            }
        }
    }
}