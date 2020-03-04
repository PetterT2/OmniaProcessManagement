import { DrawingShapeDefinition } from './DrawingShapeDefinition';

export interface DrawingRectShapeDefinition extends DrawingShapeDefinition {
    roundX: number;
    roundY: number;
}