﻿import { fabric } from 'fabric';
import { IFabricShape, FabricShapeType } from './IFabricShape';
import { FabricShape } from './FabricShape';
import { DrawingShapeDefinition } from '../../models';


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

    private getRequiredProperties(): { [k: string]: any } {
        let opt = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            opt['left'] = options['left'];
            opt['top'] = options['top'];
            opt['fill'] = options['fill'];
            opt['stroke'] = options['stroke'];
            opt['strokeWidth'] = options['strokeWidth'];
            opt['width'] = options['width'] * options['scaleX'];
            opt['height'] = options['height'] * options['scaleY'];
            opt['angle'] = options['angle'];
        }
        return opt;
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        return prop;
    }

    getShapeNodeJson(): IFabricShape {
        return {
            shapeNodeType: this.shapeNodeType,
            properties: Object.assign(this.getRequiredProperties(), this.getSpecificProperties())
        };
    }
}