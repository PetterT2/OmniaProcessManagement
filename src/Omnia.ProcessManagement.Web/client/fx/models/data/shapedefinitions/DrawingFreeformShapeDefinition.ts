import { FabricShapeData } from '../../../processshape/fabricshape/FabricShapeData';
import { DrawingShapeDefinition } from './DrawingShapeDefinition';

export interface DrawingFreeformShapeDefinition extends DrawingShapeDefinition {
    nodes: FabricShapeData[];
}