﻿import fabric from 'fabric/fabric-impl';
import { FabricShape, FabricShapeData } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../models';
import { MultilingualString } from '@omnia/fx-models';

export declare abstract class Shape implements IShape {
    definition: DrawingShapeDefinition;
    shapeTemplateTypeName: string;
    nodes: FabricShapeData[];
    left: number;
    top: number;
    readonly shapeObject: fabric.Object[];
    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean);
    setAllowHover(allowSetHover: boolean);
    setHoveredShape(isHovered: boolean);
    setSelectedShape(isSelected: boolean);
    isHover(): boolean;
    abstract ready(): Promise<boolean>;
    abstract getShapeJson(): IShape;
    abstract addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number, enableGrid?: boolean);
    abstract getTextPosition(position: { left: number, top: number }, width: number, height: number, xAdjustment?: number, yAdjustment?: number): { left: number, top: number };
}

interface ShapeClasses<T> {
    new(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean): T;
}

class ShapeClassesFactory<T> {
    public createService(ctor: ShapeClasses<T>, definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        return new ctor(definition, nodes, title, selectable, left, top, darkHighlight);
    }
}
export const ShapeFactory: ShapeClassesFactory<Shape> = new ShapeClassesFactory<Shape>();
