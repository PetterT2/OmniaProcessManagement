import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeDataTypes } from './FabricShapeData';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricPolygonShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);        
        this.fabricObject = new fabric.Polygon(this.properties['points'] || [], this.properties);
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            prop["points"] = options["points"];
        }
        return prop;
    }

    get fabricShapeDataType() {
        return FabricShapeDataTypes.polygon;
    }
}