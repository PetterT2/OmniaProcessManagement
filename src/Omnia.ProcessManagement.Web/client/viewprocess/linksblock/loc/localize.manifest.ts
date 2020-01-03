import { Composer } from '@omnia/tooling/composers';
import { LinksBlockLocalization } from "./localize";

Composer.registerManifest("b85802f3-a1bb-446a-a3be-828231696945")
    .registerLocalization()
    .namespace(LinksBlockLocalization.namespace)
    .add<LinksBlockLocalization.locInterface>({
        LinksBlockSettings: {
            Title: "Title"
        }
    });