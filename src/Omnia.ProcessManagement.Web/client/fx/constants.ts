import { ShapeTemplate } from './models/data/drawingdefinitions';

export const TextSpacingWithShape = 5;

export const ShapeTemplatesConstants = {    
    get Circle(): ShapeTemplate {
        return {
            id: "b98c7edb-4739-4f88-b14b-55e2fc5d5a55", name: "CircleShape", title: { isMultilingualString: true, "en-us": "Circle", "sv-se": "Circle" }
        }
    },
    get Pentagon(): ShapeTemplate {
        return {
            id: "b226d2e8-264c-45b8-832d-905e55a74b13", name: "PentagonShape", title: { isMultilingualString: true, "en-us": "Pentagon", "sv-se": "Pentagon" }
        }
    },
    get Diamond(): ShapeTemplate {
        return {
            id: "16b5dd18-8de2-4bbd-9aaa-27b4cb155b37", name: "DiamondShape", title: { isMultilingualString: true, "en-us": "Diamond", "sv-se": "Diamond" }
        }
    },
    get Freeform(): ShapeTemplate {
        return {
            id: "d7b2fee0-0435-46aa-8606-c7144d128d53", name: "FreeformShape", title: { isMultilingualString: true, "en-us": "Freeform", "sv-se": "Freeform" }
        }
    },
    get Media(): ShapeTemplate {
        return {
            id: "b4d016f4-2bee-47f1-aa1f-0a5747c7b0b1", name: "MediaShape", title: { isMultilingualString: true, "en-us": "Media", "sv-se": "Media" }
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
    get versionType() { return "VersionType"},
}

export const ShapeHighlightProperties = {
    get dark() {
        return {
            stroke: 'white',
            strokeDashArray: [5,5]
        }
    },
    get light() {
        return {
            stroke: 'black',
            strokeDashArray: [5, 5]
        }
    }
}