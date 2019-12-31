import { Composer } from '@omnia/tooling/composers';
import { ContentBlockLocalization } from "./localize";

Composer.registerManifest("36819e0b-9f7c-44fb-8141-5e767066d023")
    .registerLocalization()
    .namespace(ContentBlockLocalization.namespace)
    .add<ContentBlockLocalization.locInterface>({
        ContentBlockSettings: {
            Title: "Title"
        }
    });