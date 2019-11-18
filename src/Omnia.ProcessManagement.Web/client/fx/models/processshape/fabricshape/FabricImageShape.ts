import { FabricShapeExtention } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export class FabricImageShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Image;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.properties = {};
        if (properties) {
            this.properties = properties;
        }
        else if (definition) {
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
            //TO DO
        }
        var image = new Image();
        image.onload =  (img)=> {
            var pug = new fabric.Image(image, {
                angle: 45,
                width: 500,
                height: 500,
                left: 50,
                top: 70,
                scaleX: .25,
                scaleY: .25
            });
        };
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.image;
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
            shapeNodeType: FabricShapeNodeTypes.image,
            properties: this.properties
        };
    }
}