import { DrawingShape } from './DrawingShape';

export interface CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    drawingShapes: Array<DrawingShape>;
}