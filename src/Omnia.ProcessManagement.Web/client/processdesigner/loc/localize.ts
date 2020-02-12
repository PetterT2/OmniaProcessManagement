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
        ShowGridlinnes: string,
        HighlightShapes: string,
        OnDarkBackground: string,
        OnLightBackground: string,
        AddImage: string;
        EditImage: string;
        AllShapes: string;
        RecentShapes: string;
        AddShape: string;
        RedrawShape: string;
        DrawShape: string;
        DeleteShape: string;
        DeleteDrawing: string;
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
        AddHeader: string;
        EditHeader: string;
        AddTask: string;
        EditTask: string;
        EditLink: string;
        NoProperties: string;
        CreateProcessStep: string;
        NoDrawingMessage: string;
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
        CreateDrawing: string,
        ProcessTemplateDoesNotHaveShapeDefinitions: string;
        FilterShapeDefinitionNoResult: string;
        Media: string;
        FreeForm: string;
        DiscardChangeConfirmMessage: string;
        MessageNoLinksItem: string;
        MessageNoTasksItem: string;
        ShapeSettings: string;
        DeleteShapeConfirmMessage: string;
        DrawFreeform: string;
        CheckedOutTo: string;
        ChangeProcessType: string;
        ProcessType: string;
    }
}