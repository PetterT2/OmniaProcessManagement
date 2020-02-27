﻿import { Guid } from '@omnia/fx-models';

export class OPMService {
    public static get Id(): Guid { return new Guid("e1849a9d-4d94-4f47-b2d8-918f73df8759"); }
}

export class OPMResourceManifests {
    public static get Core(): Guid { return new Guid('d5544e6c-494d-4e8a-9284-b0e64d3d19d7') }
    public static get FxCore(): Guid { return new Guid('52d954c2-e55d-4e19-9276-b6c1b109044e') }
    public static get Contexts(): Guid { return new Guid("c80546fb-f27d-4307-82aa-0fc5ffb44b33"); }

    public static get ProcessDesignerCore(): Guid { return new Guid("62107b6e-02ca-4df9-a3f4-273cc5a61fb1"); }
    public static get ProcessDesignerItem(): Guid { return new Guid("9b9a5055-d871-42a8-aba6-59bb66cce039"); }
    public static get ProcessDesigner(): Guid { return new Guid("8c220ecc-3171-4549-a3a3-051a7ef76d87"); }
    public static get ProcessDesignerDrawingCanvasSettings(): Guid { return new Guid("55f7b908-73e1-4e0c-8c8f-caae6f58b34f"); }
    public static get ProcessDesignerAddShapeWizard(): Guid { return new Guid("727d945c-5bb9-42bc-ae80-3f3f9d9251a4"); }
    public static get ProcessDesignerShapeSelectionStep(): Guid { return new Guid("337862cc-491e-40a6-8515-f01eb256aea8"); }
    public static get ProcessDesignerShapeTypeStep(): Guid { return new Guid("a675ce84-2608-45e7-b05d-a0dc99f1e203"); }
    public static get ProcessDesignerCreateLinkPanel(): Guid { return new Guid("f9781b8a-0791-4c8e-8e5a-e527b0a70ec5"); }
    public static get ProcessDesignerShapeSettingsPanel(): Guid { return new Guid("686ddca5-8634-43fb-bd09-9f00fae47a39"); }
    public static get ProcessDesignerShapePickerCore(): Guid { return new Guid("a7258ae7-67fb-4dec-a487-de66102ae3aa"); }
    public static get ProcessDesignerCreateTask(): Guid { return new Guid("292697b2-1b4b-472d-bf18-460212cd7ea8"); }

    public static get ProcessRollupCore(): Guid { return new Guid("ac33e4e6-3c32-491e-93ca-e41906a75b3c"); }
    public static get ProcessRollupViewRegistration(): Guid { return new Guid("92fde160-9517-40a7-8d70-60628dad42f0"); }
}

export class OPMWebComponentManifests {
    public static get ProcessLibraryCore(): Guid { return new Guid('e082fb71-3058-4e28-8630-a649aeebc4ad'); }
    public static get ProcessLibrary(): Guid { return new Guid('b8f104b0-0458-43ca-bdc7-6c70ccb59443'); }
    public static get ProcessLibrarySettings(): Guid { return new Guid('0eae69fb-381a-445a-9593-69ad5176e1ca'); }
    public static get ProcessLibraryListView(): Guid { return new Guid('b507c023-ddd4-40e2-bffc-2ed4c80c9557'); }
    public static get NewProcessDialog(): Guid { return new Guid('b466768f-c8b7-4bfd-ab56-4b16ca9b9fcd'); }
    public static get DraftActionButtons(): Guid { return new Guid('71c66827-46b0-4fc1-b30f-593b7c88f7e3'); }
    public static get DraftMenuActions(): Guid { return new Guid('1682ae90-f19f-4440-adc0-134746eee6c1'); }
    public static get DraftProcessingStatus(): Guid { return new Guid('cde5a81e-7ca7-4a30-9d2d-9084499ec68e'); }
    public static get PublishedMenuActions(): Guid { return new Guid('54023b5d-2ce5-4e68-89cf-defc4ff6a327'); }
    public static get PublishedProcessingStatus(): Guid { return new Guid('bdfb6a67-ca86-481c-a7a0-a3caaf9f685e'); }
    public static get ProcessHistoryDialog(): Guid { return new Guid('eda1224e-d141-4937-bd05-c67318598c37'); }

    public static get ProcessSearchTemplate(): Guid { return new Guid('caa4f687-e72e-4f69-bb09-4d360f3a6608') }

    public static get MediaPicker(): Guid { return new Guid('7bb3613d-baac-408a-8ada-c195632a6be1') }
    public static get FreeformPicker(): Guid { return new Guid('544b9ae0-3fa7-440d-b62b-d2cbc36d6fe3') }

    public static get GlobalProcessRenderer(): Guid { return new Guid('a7b2e5ed-a754-41ca-afae-f32325abb91e'); }

    public static get PointPicker(): Guid { return new Guid('601b298e-7d64-4faf-91fd-1daac7b80267'); }

    public static get UnpublishProcessDialog(): Guid { return new Guid('350726cf-ae39-438f-bc34-ffe1a173a49a'); }

    public static get PermissionDialog(): Guid { return new Guid('5b7169cd-7003-4cf6-a86e-4a7a38250ec3'); }
    public static get ProcessStepPicker(): Guid { return new Guid('5a0c11c9-9691-47a1-9f7d-2aedfc8dbce7'); }

    public static get ContentBlock(): Guid { return new Guid('dbb39473-aea9-445d-a032-701bda353439'); }
    public static get ContentBlockSettings(): Guid { return new Guid('ba9c1472-bcf7-4925-8cc8-900993b43caa'); }

    public static get DrawingBlock(): Guid { return new Guid('7f8445de-8499-4e4e-80d6-8e3c852af367'); }
    public static get DrawingBlockSettings(): Guid { return new Guid('c1dacea1-10f7-4543-b01b-cb85525ef3a2'); }

    public static get TasksBlock(): Guid { return new Guid('47614dde-ea27-47e1-8cb5-29971d4f7516'); }
    public static get TasksBlockSettings(): Guid { return new Guid('3c40a1a1-4ee9-46ef-85cf-93aa11a3771a'); }

    public static get LinksBlock(): Guid { return new Guid('7227e805-61f8-4ffc-9ed9-657a4ce21bb1'); }
    public static get LinksBlockSettings(): Guid { return new Guid('8f058d05-1a9b-4ea1-a6cc-87fae540bd91'); }

    public static get ProcessNavigationBlock(): Guid { return new Guid('82677598-496e-48aa-99ae-96b23aa6f4a9'); }
    public static get ProcessNavigationBlockSettings(): Guid { return new Guid('321378ba-2fc3-449b-b321-95368b987590'); }

    public static get BreadcrumbBlock(): Guid { return new Guid('2368673d-bd45-404c-9c26-1fa348777979'); }
    public static get BreadcrumbBlockSettings(): Guid { return new Guid('af778544-870c-4c2e-9aaa-ea6d87d8d257'); }

    public static get ProcessRollup(): Guid { return new Guid('f9f26f4b-6c1c-40a1-b10e-781f0062bfd3'); }
    public static get ProcessRollupSettings(): Guid { return new Guid('0aec18e0-41d3-4148-b08a-0c123d83b4cb'); }
    public static get ProcessRollupListView(): Guid { return new Guid('6fa93477-75b3-4dd0-a626-62a484905ecd'); }
    public static get ProcessRollupListViewSettings(): Guid { return new Guid('d5ea454b-d65b-45c3-9c77-9e01f684c1e2'); }

    public static get PropertiesBlock(): Guid { return new Guid('6fbb96f3-40e7-45ee-b99e-68533a993bd4'); }
    public static get PropertiesBlockSettings(): Guid { return new Guid('bdab3f12-f9b8-4891-847f-a7a84ff8e27e'); }

    public static get TitleBlock(): Guid { return new Guid('3d5e86a2-8f75-4928-85a0-8a7d1e7414b4'); }
    public static get TitleBlockSettings(): Guid { return new Guid('87c0e638-1418-4388-acff-91747fb81f00'); }

    public static get DocumentsBlock(): Guid { return new Guid('1bbb910b-55f9-4fca-8df3-378dc247421a'); }
    public static get DocumentsBlockSettings(): Guid { return new Guid('440bce2f-7c07-431b-8e0d-344e166f26d2'); }

    public static get ChangeProcessType(): Guid { return new Guid("620a862b-bc33-46c0-b5c8-2896be4d902f"); }

    public static get AddLinkedProcess(): Guid { return new Guid("8acf47a2-704c-4b59-abab-2ae0164a650d"); }

    public static get ProcessFieldValueDefinition(): Guid { return new Guid("4b112115-10db-4fc9-b142-d416bf9a5a2b"); }
    public static get ProcessFieldEdit(): Guid { return new Guid("1b9a01a1-578f-4738-88c8-429b2254a4c2"); }
    public static get ProcessFieldDisplay(): Guid { return new Guid("8ce56269-a586-4d61-840b-dc00c6abc0e7"); }
    public static get ProcessPicker(): Guid { return new Guid("008cccc5-c6f5-474a-86fa-9dfb2232fef7");}
}

