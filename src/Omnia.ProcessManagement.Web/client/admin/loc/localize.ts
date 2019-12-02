export module OPMAdminLocalization {
    export const namespace = "OPM.Admin";
    export interface locInterface {
        ProcessManagement: string,
        Settings: string,
        ArchiveSiteUrl: string,
        ProcessTypes: {
            Title: string,
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