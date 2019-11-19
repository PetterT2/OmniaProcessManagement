import { FabricShapeExtention } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes, IShapeNode } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export class FabricImageShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Image;
    imageUrl: string;

    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }, imageUrl?: string) {
        this.initProperties(definition, isActive, properties,imageUrl);
    }

    private initProperties(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }, imageUrl?: string) {
        this.properties = {};
        this.properties["originX"] = "left";
        this.properties["originY"] = "top";
        if (properties) {
            this.imageUrl = this.properties['imageUrl'];
            Object.keys(properties).forEach(key => {
                this.properties[key] = properties[key];
            });
        }
        if (definition) {
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = isActive ? definition.activeBackgroundColor : definition.backgroundColor;
            this.properties["borderColor"] = isActive ? definition.activeBorderColor : definition.borderColor;
        }
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.imageUrl && this.imageUrl != '') {
                var image = new Image();
                image.onload = (img) => {
                    this.fabricObject = new fabric.Image(image, this.properties);
                    resolve(true);
                };
                image.src = this.imageUrl;
            }
        })
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.image;
    }

    getShapeNodeJson(): IShapeNode {
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            this.properties = [];
            Object.keys(options).forEach(key => {
                if (options[key])
                    this.properties[key] = options[key];
            });
            this.properties['imageUrl'] = this.imageUrl;
        }
        return {
            shapeNodeType: FabricShapeNodeTypes.image,
            properties: this.properties
        };
    }
}