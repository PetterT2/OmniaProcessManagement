import { FabricShapeTypes } from './IFabricShape';
import { fabric } from 'fabric';
import { FabricShapeExtension } from './FabricShapeExtention';
import { FabricShape } from './FabricShape';
import { DrawingShapeDefinition } from '../../models';

export class FabricCircleShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.initCircleProperties(definition);
    }

    private initCircleProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties["radius"] = definition.width / 2;
        }
        this.fabricObject = new fabric.Circle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.circle;
    }
}