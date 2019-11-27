import { DrawingShape } from './DrawingShape';

export interface ICanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
}

export interface CanvasDefinition extends ICanvasDefinition {
    drawingShapes: Array<DrawingShape>;
}