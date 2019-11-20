import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../data';
import { FabricShape } from './FabricShape';

export class FabricPathShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        this.fabricObject = new fabric.Path(this.properties['path'] || [], this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.path;
    }
}