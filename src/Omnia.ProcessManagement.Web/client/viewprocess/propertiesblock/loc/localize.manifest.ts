import { Composer } from '@omnia/tooling/composers';
import { PropertiesBlockLocalization } from "./localize";

Composer.registerManifest("a3549eda-4143-4d55-b67e-3fdde4586ea0")
    .registerLocalization()
    .namespace(PropertiesBlockLocalization.namespace)
    .add<PropertiesBlockLocalization.locInterface>({
        PropertiesBlockSettings: {
            Title: "Title"
        },
        Settings: {
            SelectProperties: "Select properties",
            SelectPropertySet: "Select property set",
            ShowLabel: "Show label",
            DateFormatMode: "Date Type",
            Format: "Format",
            FormatModeDefault: "Default",
            FormatModeNormal: "Classic",
            FormatModeSocial: "Social",
        },
        Properties: {
            Published: "Published",
            LinkToProcessLibrary: "Link to Process Library"
        }
    });