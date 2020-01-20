﻿import fabric from 'fabric/fabric-impl';
import { FabricShape, IFabricShape } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../models';
import { MultilingualString } from '@omnia/fx-models';

export declare abstract class Shape implements IShape {
    definition: DrawingShapeDefinition;
    name: string;
    nodes: IFabricShape[];
    left: number;
    top: number;
    readonly shapeObject: fabric.Object[];
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean);
    setAllowHover(allowSetHover: boolean);
    setSelectedShape(isSelected: boolean);
    isHover(): boolean;
    abstract ready(): Promise<boolean>;
    abstract getShapeJson(): IShape;
    abstract addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number);
    abstract getTextPosition(position: { left: number, top: number }, width: number, height: number, xAdjustment?: number, yAdjustment?: number): { left: number, top: number };
}

export interface Shape {

}

interface ShapeClasses<T> {
    new(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean): T;
}

class ShapeClassesFactory<T> {
    public createService(ctor: ShapeClasses<T>, definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean) {
        return new ctor(definition, nodes, title, selectable, left, top, grouping);
    }
}
export const ShapeFactory: ShapeClassesFactory<Shape> = new ShapeClassesFactory<Shape>();
