import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../data';
import { isatty } from 'tty';

export class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Circle;

    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        this.initProperties(definition, isActive, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        this.properties = {};
        this.properties["originX"] = "left";
        this.properties["originY"] = "top";
        if (properties) {
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        }
        if (definition) {
            this.properties["radius"] = definition.width / 2;
            this.properties["fill"] = isActive ? definition.activeBackgroundColor : definition.backgroundColor;
            this.properties["borderColor"] = isActive ? definition.activeBorderColor : definition.borderColor;
        }
        this.fabricObject = new fabric.Circle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.circle;
    }

    getShapeNodeJson(): IShapeNode {
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