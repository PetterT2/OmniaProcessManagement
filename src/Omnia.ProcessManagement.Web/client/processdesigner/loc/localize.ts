export module ProcessDesignerLocalization {
    export const namespace = "OPM.ProcessDesigner";
    export interface locInterface {
        CanvasSettings: string;
        BackgroundImage: string;
        Size: string;
        Width: string;
        Height: string;
        GridX: string;
        GridY: string;
        AddImage: string;
        AllShapes: string;
        RecentShapes: string;
        AddShape: string;
        SelectShape: string;
        ShapeType: string;
        Search: string;
        ShapeTypes: {
            None: string;
            ProcessStep: string;
            Link: string;
        },
        New: string;
        AddLink: string;
        EditLink: string;
        NoProperties: string;
        CreateProcessStep: string;
        EditTitle: string;
        DeleteProcessStep: {
            Label: string;
            ConfirmationMessage: string;
            WarningReferenceProcessStepMessage: string;
            WarningMultipleDeletingProcessStepMessage: string
        };
        MoveProcessStep: string;
        NewDataNotSaved: string;
        NewDataHasBeenSaved: string;
        LinkObject: {
            OpenNewWindow: string;
        };
        ChangeShape: string;
        ProcessTemplateDoesNotHaveShapeDefinitions: string;
        Media: string;
        FreeForm: string;
    }
}