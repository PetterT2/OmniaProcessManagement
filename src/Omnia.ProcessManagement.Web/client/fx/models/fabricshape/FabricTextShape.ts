import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefination } from '../data';

export default class FabricTextShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    text: string;

    constructor(defination: DrawingShapeDefination) {
        this.initProperties(defination);
    }

    private initProperties(uiSettings: DrawingShapeDefination) {
        if (uiSettings) {
            this.properties = {};
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["fontSize"] = uiSettings.fontSize;
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.rect;
    }

    setProperties(options: fabric.ITextOptions, text?: string) {
        this.text = text;
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Text(this.text, this.properties);
    }
}