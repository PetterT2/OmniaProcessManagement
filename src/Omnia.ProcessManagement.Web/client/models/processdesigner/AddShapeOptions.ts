﻿import { DrawingShapeDefinition, DrawingShapeTypes, CanvasDefinition, ShapeTemplateType } from '../../fx/models';
import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { FabricShapeData, ShapeObject } from '../../fx';

export interface DrawingShapeOptions {
    id?: GuidValue;
    shapeDefinition: DrawingShapeDefinition;
    shapeType: DrawingShapeTypes;
    title: MultilingualString;
    processStepId?: GuidValue;
    customLinkId?: GuidValue;
    externalProcesStepId?: GuidValue;
    linkedRootProcessStepId?: GuidValue;
    shape?: ShapeObject;
    isRenderAndReset?: boolean;
}