import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../processshape';

export default class FabricImageShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    image: string | HTMLImageElement | HTMLVideoElement;

    constructor(uiSettings: ShapeSettings) {
        this.initProperties(uiSettings);
    }

    private initProperties(uiSettings: ShapeSettings) {
        if (uiSettings) {
            this.properties = {};
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
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