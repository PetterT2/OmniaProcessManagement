import { FabricShapeData } from '../fabricshape';
import { DrawingShapeDefinition } from '../../models';

export interface ShapeObject {
    shapeTemplateTypeName: string; // to quickly create shape instance
    nodes: FabricShapeData[];
    definition: DrawingShapeDefinition;
    left: number;
    top: number;
}
