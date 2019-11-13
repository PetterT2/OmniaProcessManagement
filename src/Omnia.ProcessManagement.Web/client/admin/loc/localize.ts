export module OPMAdminLocalization {
    export const namespace = "OPM.Admin";
    export interface locInterface {
        ProcessManagement: string,
        Settings: string,
        ProcessTypes: {
            Title: string
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
            AddShape: string
        }
    }
}