import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeDataTypes, FabricShapeData } from './FabricShapeData';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricPolylineShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.fabricObject = new fabric.Polyline(this.properties['points'] || [], this.properties);
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
        return FabricShapeDataTypes.polyline;
    }

    calculateScalePointsToDefinition(scaleX: number, scaleY: number) {
        let matrix = [scaleX, 0, 0, scaleY, 0, 0];
        let points = [];
        (this.fabricObject as fabric.Polyline).points.forEach(p => {
            points.push( fabric.util.transformPoint(p, matrix));
        });
        let position = fabric.util.transformPoint(new fabric.Point(this.fabricObject.left, this.fabricObject.top), matrix);
    }
}