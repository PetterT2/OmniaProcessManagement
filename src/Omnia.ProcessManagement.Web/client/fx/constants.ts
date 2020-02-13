import { CanvasDefinition } from './models/data/drawingdefinitions';
import { ShapeTemplate } from './models/data/shapetemplates/ShapeTemplate';
import { ShapeTemplateType } from './models/data/enums/Enums';
import { Version } from './models';

export const TextSpacingWithShape = 5;

export const ShapeTemplatesConstants = {
    get Circle(): ShapeTemplate {
        return {
            id: "b98c7edb-4739-4f88-b14b-55e2fc5d5a55",
            title: { isMultilingualString: true, "en-us": "Circle" },
            builtIn: true,
            settings: {
                type: ShapeTemplateType.CircleShape
            },
            multilingualTitle: ""
        }
    },
    get Pentagon(): ShapeTemplate {
        return {
            id: "b226d2e8-264c-45b8-832d-905e55a74b13",
            title: { isMultilingualString: true, "en-us": "Pentagon" },
            builtIn: true,
            settings: {
                type: ShapeTemplateType.PentagonShape
            },
            multilingualTitle: ""
        }
    },
    get Diamond(): ShapeTemplate {
        return {
            id: "16b5dd18-8de2-4bbd-9aaa-27b4cb155b37",
            title: { isMultilingualString: true, "en-us": "Diamond" },
            builtIn: true,
            settings: {
                type: ShapeTemplateType.DiamondShape
            },
            multilingualTitle: ""
        }
    },
    get Freeform(): ShapeTemplate {
        return {
            id: "d7b2fee0-0435-46aa-8606-c7144d128d53",
            title: { isMultilingualString: true, "en-us": "Freeform" },
            builtIn: true,
            settings: {
                type: ShapeTemplateType.FreeformShape
            },
            multilingualTitle: ""
        }
    },
    get Media(): ShapeTemplate {
        return {
            id: "b4d016f4-2bee-47f1-aa1f-0a5747c7b0b1",
            title: { isMultilingualString: true, "en-us": "Media" },
            builtIn: true,
            settings: {
                type: ShapeTemplateType.MediaShape
            },
            multilingualTitle: ""
        }
    }
}

export const SharePointFieldsConstants = {
    get Modified() { return "Modified" },
    get ModifiedBy() { return "Editor" },
    get Title() { return "Title" },
    get FileName() { return "FileName" },
    get FileLeafRef() { return "FileLeafRef" },
    get Status() { return "Status" },
    get AssignedTo() { return "AssignedTo" },
    get DueDate() { return "DueDate" },
    get ID() { return "ID" }
}

export const PropertyInternalNamesConstants = {
    get title() { return "title" }
}

export const ProcessRollupConstants = {
    get searchBoxInternalName() { return "40faa61d-27f9-4385-be4a-3dfa76d4d68e" },
    get fulltextInternalName() { return "d4a220c4-a804-46a8-bd91-ec5d790ffa57" },
    get processTitleAndLinkInternalName() { return "24291d72-f945-4f0f-b6c4-f0ef240f70f2" }
}

export const DefaultDateFormat = "YYYY-MM-DD";

export const ProcessTableColumnsConstants = {
    get versionType() { return "VersionType" },
}

export const ShapeHighlightProperties = {
    get dark() {
        return {
            stroke: 'white',
            strokeDashArray: [5, 5]
        }
    },
    get light() {
        return {
            stroke: 'black',
            strokeDashArray: [5, 5]
        }
    }
}

export const ProcessDefaultData = {
    get canvasDefinition(): CanvasDefinition {
        return {
            drawingShapes: [],
            width: 700,
            height: 500,
            gridX: 20,
            gridY: 20,
            backgroundImageUrl: ''
        }
    }
}

export const SystemProcessProperties = {
    get Published() {
        return "a134131f-22cb-4c49-8bbf-b3c2191ba530";
    },
    get LinkToProcessLibrary() {
        return "8bf649a0-4c3e-40a0-9932-4dd2f0f32942";
    }
}

export const OPMSpecialRouteVersion = {
    get Preview(): Version {
        return null
    },
    get Published(): Version {
        return { edition: 0, revision: 0 }
    },
    isPreview: (version: Version) => {
        return version === null;
    },
    isPublished: (version: Version) => {
        return version && version.edition === 0 && version.revision === 0;
    },
    generateVersion: (edition: number | string, revision: number | string): Version => {
        return { edition: parseInt(edition as string), revision: parseInt(revision as string) }
    }
}