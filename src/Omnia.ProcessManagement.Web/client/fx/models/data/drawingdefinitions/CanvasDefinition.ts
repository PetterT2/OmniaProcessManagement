import { IDrawingShapeNode } from './IDrawingShapeNode';

export interface CanvasDefinition {
    imageBackground?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    shapes: Array<IDrawingShapeNode>;
}