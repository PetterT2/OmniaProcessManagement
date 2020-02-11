import { Composer } from '@omnia/tooling/composers';
import { TitleBlockLocalization } from "./localize";

Composer.registerManifest("ccf2e23c-6217-4689-a12d-adfc13737c13")
    .registerLocalization()
    .namespace(TitleBlockLocalization.namespace)
    .add<TitleBlockLocalization.locInterface>({
        Formatting: "Formatting",
        FormatingOptions: {
            Normal: "Normal",
            Heading1: "Heading 1",
            Heading2: "Heading 2",
            Heading3: "Heading 3"
        }
    });