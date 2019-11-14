import { IDrawingShapeNode } from './IDrawingShapeNode';

export interface CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    shapes: Array<IDrawingShapeNode>;
}