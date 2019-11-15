import { Guid } from '@omnia/fx-models';

export class OPMService {
    public static get Id(): Guid { return new Guid("e1849a9d-4d94-4f47-b2d8-918f73df8759"); }
}

export class PmResourceManifests {
    public static get Core(): Guid { return new Guid('d5544e6c-494d-4e8a-9284-b0e64d3d19d7') }
}