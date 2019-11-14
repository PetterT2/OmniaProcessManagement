import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../data';

export class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Circle;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.properties = {};
        if (definition) {
            this.properties["radius"] = definition.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
        if (properties) {
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        }
        this.fabricObject = new fabric.Circle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.circle;
    }

    getShapeNode(): IShapeNode {
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            this.properties = [];
            Object.keys(options).forEach(key => {
                if (options[key])
                    this.properties[key] = options[key];
            });
        }
        return {
            shapeNodeType: FabricShapeNodeTypes.circle,
            properties: this.properties
        };
    }
}