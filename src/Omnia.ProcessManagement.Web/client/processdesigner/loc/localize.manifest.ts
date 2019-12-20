import { Composer } from '@omnia/tooling/composers';
import { ProcessDesignerLocalization } from "./localize";

Composer.registerManifest("7991752d-426a-4ff6-8fb1-53bd7f911af2")
    .registerLocalization()
    .namespace(ProcessDesignerLocalization.namespace)
    .add<ProcessDesignerLocalization.locInterface>({
        CanvasSettings: "Canvas Settings",
        BackgroundImage: "Background Image",
        Size: "Size",
        Width: "Width",
        Height: "Height",
        GridX: "GridX",
        GridY: "GridY",
        AddImage: "Add Image",
        AllShapes: "All Shapes",
        RecentShapes: "Recent Shapes",
        SelectShape: "Select Shape",
        AddShape: "Add Shape",
        ShapeType: "Shape Type",
        Search: "Search",
        ShapeTypes: {
            None: "None",
            ProcessStep: "Process Step",
            Link: "Link"
        },
        New: "New",
        AddLink: "Add Link",
        EditLink: "Edit Link",
        NoProperties: "There are no properties to be edited.",
        CreateProcessStep: "Create Process Step",
        MoveProcessStep: "Move Process Step",
        EditTitle: "Edit Title",
        DeleteProcessStep: {
            Label: "Delete Process Step",
            ConfirmationMessage: "Are you sure you want to delete this process step?",
            WarningReferenceProcessStepMessage: "Warning: There is one or more other process steps referencing to the deleting process step(s)!",
            WarningMultipleDeletingProcessStepMessage: "Warning: There are multiple process steps will be deleted!"
        },
        NewDataNotSaved: "New data not saved",
        NewDataHasBeenSaved: "New data has been saved",
        LinkObject: {
            OpenNewWindow: "Open new window"
        },
        ChangeShape: "Change Shape",
        ProcessTemplateDoesNotHaveShapeDefinitions: "The current process template doesn't have any Shape Definitions.",
        FilterShapeDefinitionNoResult: "No result",
        Media: "Media",
        FreeForm: "Free Form",
        ShapeSettings: "Shape Settings"
    });