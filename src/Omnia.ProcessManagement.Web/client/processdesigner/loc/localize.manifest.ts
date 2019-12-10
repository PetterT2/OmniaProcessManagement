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
        NoProperties: "There are no properties to be edited.",
        CreateProcessStep: "Create Process Step",
        MoveProcessStep: "Move Process Step"

    });