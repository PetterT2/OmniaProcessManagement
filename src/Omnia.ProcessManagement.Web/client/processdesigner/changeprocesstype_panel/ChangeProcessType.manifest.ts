import { Composer } from '@omnia/tooling/composers';
import { Guid } from '@omnia/fx-models';
import { OPMWebComponentManifests } from '../../fx/models';


Composer
    .registerManifest(OPMWebComponentManifests.ChangeProcessType, 'opm.processdesigner.changeprocesstype')
    .registerWebComponent({
        elementName: 'opm-process-changeprocesstype',
        entryPoint: './ChangeProcessType.jsx'
    });
