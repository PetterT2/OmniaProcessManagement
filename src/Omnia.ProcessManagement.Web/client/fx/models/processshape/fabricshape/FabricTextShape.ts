import { FabricShapeExtention } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export class FabricTextShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Text;

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
            this.properties["width"] = definition.width;
            this.properties["fill"] = isActive ? definition.activeTextColor : definition.textColor;
            this.properties["fontSize"] = definition.fontSize;
            this.properties["originX"] = 'center';
            this.properties["textAlign"] = 'center';
        }
        this.fabricObject = new fabric.Text(this.properties['text'] || "", this.properties);       
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.text;
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
            shapeNodeType: FabricShapeNodeTypes.text,
            properties: this.properties
        };
    }
}