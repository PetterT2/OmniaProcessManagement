import { fabric } from 'fabric';
import { IFabricShape, FabricShapeType } from './IFabricShape';
import { FabricShape } from './FabricShape';
import { DrawingShapeDefinition } from '../..';

export class FabricShapeExtension implements FabricShape {
    properties: { [k: string]: any; };
    fabricObject: fabric.Object;

    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        this.initProperties(definition, isActive, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        this.properties = {};
        this.properties["originX"] = "left";
        this.properties["originY"] = "top";
        this.properties["hoverCursor"] = "pointer";
        if (properties) {
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        }
        if (definition) {
            this.properties["width"] = definition.width;
            this.properties["height"] = definition.height;
            this.properties["fill"] = isActive ? definition.activeBackgroundColor : definition.backgroundColor;
            this.properties["stroke"] = isActive ? definition.activeBorderColor : definition.borderColor;
        }
    }

    get shapeNodeType() {
        return null;
    }

    getShapeNodeJson(): IFabricShape {
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            this.properties = [];
            Object.keys(options).forEach(key => {
                if (options[key])
                    this.properties[key] = options[key];
            });
        }
        return {
            shapeNodeType: this.shapeNodeType,
            properties: this.properties
        };
    }
}