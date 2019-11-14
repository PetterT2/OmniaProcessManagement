export enum ShapeNodeType { }

export class FabricShapeNodeTypes {
    public static circle: ShapeNodeType = 1;
    public static ellipse: ShapeNodeType = 2;
    public static rect: ShapeNodeType = 3;
    public static polygon: ShapeNodeType = 4;
    public static text: ShapeNodeType = 5;
    public static image: ShapeNodeType = 6;
    public static triangle: ShapeNodeType = 7;
    public static path: ShapeNodeType = 8;
    public static polyline: ShapeNodeType = 9;
}

export interface IShapeNode {
    shapeNodeType: ShapeNodeType;
    properties: { [k: string]: any };
}