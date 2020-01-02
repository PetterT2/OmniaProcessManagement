import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricImageShape extends FabricShapeExtension implements FabricShape {
    imageUrl?: string;
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
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

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        prop['imageUrl'] = this.imageUrl;
        return prop;
    }
}