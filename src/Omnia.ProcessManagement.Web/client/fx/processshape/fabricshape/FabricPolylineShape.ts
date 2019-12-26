import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricPolylineShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
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

    get shapeNodeType() {
        return FabricShapeTypes.polyline;
    }

    scalePointsToDefinition(scaleX: number, scaleY: number) {
        let matrix = [scaleX, 0, 0, scaleY, 0, 0];
        let points = [];
        (this.fabricObject as fabric.Polyline).points.forEach(p => {
            points.push( fabric.util.transformPoint(p, matrix));
        });
        (this.fabricObject as fabric.Polyline).points = points;
        let position = fabric.util.transformPoint(new fabric.Point(this.fabricObject.left, this.fabricObject.top), matrix);
        this.fabricObject.left = position.x;
        this.fabricObject.top = position.y;
    }
}