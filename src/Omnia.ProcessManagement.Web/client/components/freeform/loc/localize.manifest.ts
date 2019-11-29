import { Composer } from '@omnia/tooling/composers';
import { FreeFormLocalization } from "./localize";

Composer.registerManifest("721d8995-3c5b-4da0-83be-eadbc1540539")
    .registerLocalization()
    .namespace(FreeFormLocalization.namespace)
    .add<FreeFormLocalization.locInterface>({
        NewFreeFormShape: "New Freeform Shape"
    });