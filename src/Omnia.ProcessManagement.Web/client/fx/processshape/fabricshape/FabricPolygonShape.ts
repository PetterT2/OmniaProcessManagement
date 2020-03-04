import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeDataTypes } from './FabricShapeData';
import { DrawingShapeDefinition, DrawingPentagonShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';

export class FabricPolygonShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.fabricObject = new fabric.Polygon(this.properties['points'] || [], this.properties);
        this.setControl((definition as DrawingPentagonShapeDefinition).isLine);
    }

    private setControl(isLine: boolean) {
        if (isLine) {
            this.fabricObject.padding = 4;
            this.fabricObject.hasBorders = false;
            this.fabricObject.cornerStyle = "circle";
            this.fabricObject.cornerColor = "white";
            this.fabricObject.cornerStrokeColor = "grey";
            this.fabricObject.cornerSize = 10;
            this.fabricObject.rotatingPointOffset = 20;
            this.fabricObject.transparentCorners = false;
            this.fabricObject.centeredRotation = false;
            this.fabricObject.setControlsVisibility({ bl: false, br: false, mb: false, ml: true, mt: false, mr: true, tr: false, tl: false, mtr: true });
        }
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