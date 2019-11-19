import { FabricShapeExtention } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export class FabricTriangleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Triangle;

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
            this.properties["width"] = definition.width
            this.properties["height"] = definition.height;
            this.properties["fill"] = isActive ? definition.activeBackgroundColor : definition.backgroundColor;
            this.properties["borderColor"] = isActive ? definition.activeBorderColor : definition.borderColor;
        }
        this.fabricObject = new fabric.Triangle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.triangle;
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
            shapeNodeType: FabricShapeNodeTypes.triangle,
            properties: this.properties
        };
    }
}