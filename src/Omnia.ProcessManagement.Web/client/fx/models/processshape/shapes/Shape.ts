import fabric from 'fabric/fabric-impl';
import { FabricShape, IFabricShape } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class Shape implements IShape {
    definition: DrawingShapeDefinition;
    name: string;
    nodes: IFabricShape[];
    readonly shapeObject: fabric.Object[];
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean);
    abstract ready(): Promise<boolean>;
    abstract getShapeJson(): IShape;
    abstract addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number);
}

export interface Shape {

}

interface ShapeClasses<T> {
    new(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean): T;
}

class ShapeClassesFactory<T> {
    public createService(ctor: ShapeClasses<T>, definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean) {
        return new ctor(definition, nodes, isActive, text, selectable, left, top, grouping);
    }
}
export const ShapeFactory: ShapeClassesFactory<Shape> = new ShapeClassesFactory<Shape>();
