import { FabricShapeData } from '../fabricshape';
import { DrawingShapeDefinition } from '../../models';

export interface IShape {
    shapeTemplateTypeName: string;
    nodes: FabricShapeData[];
    definition: DrawingShapeDefinition;
    left: number;
    top: number;
}
