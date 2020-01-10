import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingImageShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricImageShape extends FabricShapeExtension implements FabricShape {
    imageUrl: string;
    constructor(definition: DrawingImageShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.imageUrl = definition.imageUrl;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.imageUrl && this.imageUrl != '') {
                fabric.Image.fromURL(this.imageUrl, (image) => {
                    if (image.width > this.properties['width']) {
                        image.scaleToWidth(this.properties['width']);
                        this.properties.scaleX = image.scaleX;
                        this.properties.scaleY = image.scaleY;
                    }
                    this.properties.width = image.width;
                    this.properties.height = image.height;
                    this.fabricObject = new fabric.Image(image.getElement(), this.properties);
                    resolve(true);
                });
            }
        })
    }

    get shapeNodeType() {
        return FabricShapeTypes.image;
    }
}