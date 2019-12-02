import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricLineShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        this.fabricObject = new fabric.Line(this.properties['points'] || [], this.properties);
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            prop["points"] = [options["x1"], options["y1"], options["x2"], options["y2"]];
        }
        return prop;
    }

    get shapeNodeType() {
        return FabricShapeTypes.line;
    }
}