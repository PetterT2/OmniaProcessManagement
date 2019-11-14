import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../data';

export default class FabricImageShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    image: string | HTMLImageElement | HTMLVideoElement;

    constructor(definition: DrawingShapeDefinition) {
        this.initProperties(definition);
    }

    private initProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties = {};
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
            //TO DO
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.image;
    }

    setProperties(options: fabric.IImageOptions, image?: string | HTMLImageElement | HTMLVideoElement) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Image(this.image, this.properties);
    }
}