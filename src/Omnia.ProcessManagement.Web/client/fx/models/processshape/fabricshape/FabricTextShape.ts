import { FabricShapeExtention } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export class FabricTextShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Text;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {        
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.properties = {};
        if (definition) {
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["width"] = definition.width;
            this.properties["fill"] = definition.textColor;
            this.properties["fontSize"] = definition.fontSize;
            this.properties["originX"] = 'center';
            this.properties["textAlign"] = 'center';
        }
        if (properties) {
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        } 
        this.fabricObject = new fabric.Text(this.properties['text'] || "", this.properties);       
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.text;
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
            shapeNodeType: FabricShapeNodeTypes.rect,
            properties: this.properties
        };
    }
}