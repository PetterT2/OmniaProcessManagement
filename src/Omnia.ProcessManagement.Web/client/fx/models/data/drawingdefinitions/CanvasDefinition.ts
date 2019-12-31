import { DrawingShape } from './DrawingShape';
import { ImageRef } from '../images';

export interface ICanvasDefinition {
    backgroundImageRef?: ImageRef;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
}

export interface CanvasDefinition extends ICanvasDefinition {
    drawingShapes: Array<DrawingShape>;
}