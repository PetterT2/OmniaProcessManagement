import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../data';
import { FabricShape } from './FabricShape';

export class FabricImageShape extends FabricShapeExtension implements FabricShape {
    imageUrl?: string;
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        if (properties) {
            this.imageUrl = this.properties['imageUrl'];
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
        return FabricShapeTypes.image;
    }

    getShapeNodeJson(): IFabricShape {
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
            shapeNodeType: FabricShapeTypes.image,
            properties: this.properties
        };
    }
}