import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../data';

export default class FabricPathShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    path: string | fabric.Point[];

    constructor(definition: DrawingShapeDefinition) {
        this.initProperties(definition);
    }

    private initProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties = {};
            this.properties["path"] = [];
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
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