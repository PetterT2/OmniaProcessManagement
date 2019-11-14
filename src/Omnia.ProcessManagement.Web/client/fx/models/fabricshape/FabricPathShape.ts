import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../processshape';

export default class FabricPathShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    path: string | fabric.Point[];

    constructor(uiSettings: ShapeSettings) {
        this.initProperties(uiSettings);
    }

    private initProperties(uiSettings: ShapeSettings) {
        if (uiSettings) {
            this.properties = {};
            this.properties["path"] = [];
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.path;
    }

    setProperties(options: fabric.IPathOptions, path?: string | fabric.Point[]) {
        this.path = path;
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Path(this.path, this.properties);
    }
}