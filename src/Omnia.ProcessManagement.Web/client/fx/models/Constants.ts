import { ShapeTemplate } from './processshape';
import { ShapeNodeType, FabricShapeNodeTypes } from './fabricshape';

export const ShapeTemplatesConstants = {
    get Circle(): ShapeTemplate {
        return {
            id: "b98c7edb-4739-4f88-b14b-55e2fc5d5a55", name: "circle", title: { isMultilingualString: true, "en-us": "Circle", "sv-se": "Circle" }
        }
    },
    get Pentagon(): ShapeTemplate {
        return {
            id: "b226d2e8-264c-45b8-832d-905e55a74b13", name: "pentagon", title: { isMultilingualString: true, "en-us": "Pentagon", "sv-se": "Pentagon" }
        }
    },
    get Diamond(): ShapeTemplate {
        return {
            id: "16b5dd18-8de2-4bbd-9aaa-27b4cb155b37", name: "diamond", title: { isMultilingualString: true, "en-us": "Diamond", "sv-se": "Diamond" }
        }
    },
    get Freeform(): ShapeTemplate {
        return {
            id: "d7b2fee0-0435-46aa-8606-c7144d128d53", name: "freeform", title: { isMultilingualString: true, "en-us": "Freeform", "sv-se": "Freeform" }
        }
    },
    get Media(): ShapeTemplate {
        return {
            id: "b4d016f4-2bee-47f1-aa1f-0a5747c7b0b1", name: "media", title: { isMultilingualString: true, "en-us": "Media", "sv-se": "Media" }
        }
    }
}