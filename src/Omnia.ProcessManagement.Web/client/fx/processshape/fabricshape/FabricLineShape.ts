import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricLineShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
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

    calculateScalePointsToDefinition(scaleX: number, scaleY: number) {
        let matrix = [scaleX, 0, 0, scaleY, 0, 0]
        let options = this.fabricObject.toJSON();
        let newPoint1 = fabric.util.transformPoint(new fabric.Point(options["x1"], options["y1"]), matrix);
        let newPoint2 = fabric.util.transformPoint(new fabric.Point(options["x2"], options["y2"]), matrix);
        let newPoint3 = fabric.util.transformPoint(new fabric.Point(options["left"], options["top"]), matrix);
    }
}