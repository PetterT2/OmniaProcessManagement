import { FabricShapeTypes } from './IFabricShape';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../data';
import { FabricShapeExtension } from './FabricShapeExtention';
import { FabricShape } from './FabricShape';

export class FabricCircleShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
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