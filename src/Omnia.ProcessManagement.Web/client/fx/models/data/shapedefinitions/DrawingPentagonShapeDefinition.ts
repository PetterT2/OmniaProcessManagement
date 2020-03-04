﻿import { DrawingShapeDefinition } from './DrawingShapeDefinition';

export interface DrawingPentagonShapeDefinition extends DrawingShapeDefinition {
    arrowWidthPercent: number;
    arrowHeightPercent: number;
    height: number;
}