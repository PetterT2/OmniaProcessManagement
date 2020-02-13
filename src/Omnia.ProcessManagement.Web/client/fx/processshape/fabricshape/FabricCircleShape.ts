import { FabricShapeDataTypes } from './FabricShapeData';
import { fabric } from 'fabric';
import { FabricShapeExtension } from './FabricShapeExtention';
import { FabricShape } from './FabricShape';
import { DrawingShapeDefinition } from '../../models';

export class FabricCircleShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.initCircleProperties(definition);
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();

            prop["radius"] = options["radius"];
            prop["startAngle"] = options["startAngle"];
            prop["endAngle"] = options["endAngle"];
            prop["scaleY"] = options["scaleY"];
            prop["scaleX"] = options["scaleX"];
        }
        return prop;
    }

    private initCircleProperties(definition: DrawingShapeDefinition) {
        if (definition && !this.properties["radius"]) {
            this.properties["radius"] = definition.width / 2;
        }
        this.fabricObject = new fabric.Circle(this.properties);
    }

    get fabricShapeDataType() {
        return FabricShapeDataTypes.circle;
    }
}