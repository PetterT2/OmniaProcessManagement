import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../ShapeSettings';

export default class FabricTextShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Text;

    constructor(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        this.initProperties(uiSettings, properties);
    }

    private initProperties(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        if (properties) {
            this.properties = properties;
        }
        else if (uiSettings) {
            this.properties = {};
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["fontSize"] = uiSettings.fontSize;
        }
        this.fabricObject = new fabric.Text(this.properties['text'] || "", this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.text;
    }

    setProperties(options: fabric.ITextOptions, text?: string) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject = new fabric.Text(text, this.properties);
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}