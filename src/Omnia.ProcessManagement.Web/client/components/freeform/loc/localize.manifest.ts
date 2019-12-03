import { Composer } from '@omnia/tooling/composers';
import { FreeFormDrawingLocalization } from "./localize";

Composer.registerManifest("721d8995-3c5b-4da0-83be-eadbc1540539")
    .registerLocalization()
    .namespace(FreeFormDrawingLocalization.namespace)
    .add<FreeFormDrawingLocalization.locInterface>({
        NewFreeFormShape: "New FreeForm Shape"
    });