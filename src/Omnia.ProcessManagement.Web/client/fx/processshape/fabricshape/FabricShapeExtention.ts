import { fabric } from 'fabric';
import { IFabricShape, FabricShapeTypes } from './IFabricShape';
import { FabricShape } from './FabricShape';
import { DrawingShapeDefinition } from '../../models';


export class FabricShapeExtension implements FabricShape {
    properties: { [k: string]: any; };
    fabricObject: fabric.Object;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.properties = {};
        this.properties["originX"] = "left";
        this.properties["originY"] = "top";
        this.properties["hoverCursor"] = "pointer";
        this.properties["strokeUniform"] = true;
        this.properties['strokeWidth'] = 1;
        if (properties) {
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        }
        if (definition) {
            this.properties["width"] = definition.width;
            this.properties["height"] = definition.height;
            this.properties["fill"] = definition.backgroundColor;
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
            opt['strokeWidth'] = 1;
            opt['width'] = Math.floor(options['width'] * options['scaleX']);
            opt['height'] = Math.floor(options['height'] * options['scaleY']);
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