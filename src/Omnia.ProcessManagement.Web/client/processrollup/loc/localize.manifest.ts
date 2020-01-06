import { Composer } from '@omnia/tooling/composers';
import { ProcessRollupLocalization } from "./localize";

Composer.registerManifest("39ea7d35-7472-48f4-825d-866b0ddce732")
    .registerLocalization()
    .namespace(ProcessRollupLocalization.namespace)
    .add<ProcessRollupLocalization.locInterface>({
        BlockTitle: "Process Rollup",
        BlockDescription: "Possibility to roll up processes with different views, filters and refiners.",
        ViewTitle: {
            List: "List View"
        }
    });