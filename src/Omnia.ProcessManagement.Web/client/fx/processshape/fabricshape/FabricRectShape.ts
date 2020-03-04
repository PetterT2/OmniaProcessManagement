import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeDataTypes } from './FabricShapeData';
import { DrawingShapeDefinition, DrawingRectShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricRectShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingRectShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.properties.rx = definition.roundX;
        this.properties.ry = definition.roundY;
        this.fabricObject = new fabric.Rect(this.properties);
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();

            prop["rx"] = options["rx"];
            prop["ry"] = options["ry"];
        }
        return prop;
    }

    get fabricShapeDataType() {
        return FabricShapeDataTypes.rect;
    }
}