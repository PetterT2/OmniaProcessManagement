import { Composer } from '@omnia/tooling-composers';
import { OPMWebComponentManifests } from '../../../fx/models';

Composer.registerManifest(OPMWebComponentManifests.ProcessFieldValueDefinition, "opm.ux.enterpriseproperties.valuedefinition.processfield")
    .registerWebComponent({
        elementName: "opm-enterpriseproperties-process-value-definition",
        entryPoint: "./ProcessFieldValueDefinition.tsx",
        typings: ["./IProcessFieldValueDefinition.ts"]
    });