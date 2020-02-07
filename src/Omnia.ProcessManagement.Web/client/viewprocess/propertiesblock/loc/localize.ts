export module PropertiesBlockLocalization {
    export const namespace = "OPM.PropertiesBlock";
    export interface locInterface {
        PropertiesBlockSettings: {
            Title: string
        },
        Settings: {
            SelectProperties: string,
            SelectPropertySet: string,
            ShowLabel: string;
            DateFormatMode: string;
            Format: string;
            FormatModeDefault: string;
            FormatModeNormal: string;
            FormatModeSocial: string;
        },
        Properties: {
            Published: string,
            LinkToProcessLibrary: string
        }
    }
}