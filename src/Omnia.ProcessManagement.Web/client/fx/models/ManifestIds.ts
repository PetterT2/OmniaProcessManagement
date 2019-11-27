import { Guid } from '@omnia/fx-models';

export class OPMService {
    public static get Id(): Guid { return new Guid("e1849a9d-4d94-4f47-b2d8-918f73df8759"); }
}

export class OPMResourceManifests {
    public static get Core(): Guid { return new Guid('d5544e6c-494d-4e8a-9284-b0e64d3d19d7') }
    public static get FxCore(): Guid { return new Guid('52d954c2-e55d-4e19-9276-b6c1b109044e') }

    public static get ProcessDesignerCore(): Guid { return new Guid("62107b6e-02ca-4df9-a3f4-273cc5a61fb1"); }
    public static get ProcessDesignerItem(): Guid { return new Guid("9b9a5055-d871-42a8-aba6-59bb66cce039"); }
    public static get ProcessDesigner(): Guid { return new Guid("8c220ecc-3171-4549-a3a3-051a7ef76d87"); }
}

export class OPMWebComponentManifests {
    public static get ProcessLibraryCore(): Guid { return new Guid('e082fb71-3058-4e28-8630-a649aeebc4ad'); }
    public static get ProcessLibrary(): Guid { return new Guid('b8f104b0-0458-43ca-bdc7-6c70ccb59443'); }
    public static get ProcessLibrarySettings(): Guid { return new Guid('0eae69fb-381a-445a-9593-69ad5176e1ca'); }
    public static get ProcessLibraryListView(): Guid { return new Guid('b507c023-ddd4-40e2-bffc-2ed4c80c9557'); }
    public static get NewProcessDialog(): Guid { return new Guid('b466768f-c8b7-4bfd-ab56-4b16ca9b9fcd'); }

}

