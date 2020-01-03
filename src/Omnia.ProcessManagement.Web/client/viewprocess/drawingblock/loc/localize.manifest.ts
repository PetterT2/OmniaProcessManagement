import { Composer } from '@omnia/tooling/composers';
import { DrawingBlockLocalization } from "./localize";

Composer.registerManifest("8a159b9d-df7f-4040-aca3-e91b47b5b740")
    .registerLocalization()
    .namespace(DrawingBlockLocalization.namespace)
    .add<DrawingBlockLocalization.locInterface>({
        DrawingBlockSettings: {
            Title: "Title"
        }
    });