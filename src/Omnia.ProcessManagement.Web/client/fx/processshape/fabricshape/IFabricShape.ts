export enum FabricShapeType { }

export class FabricShapeTypes {
    public static circle: FabricShapeType = 1;
    public static ellipse: FabricShapeType = 2;
    public static rect: FabricShapeType = 3;
    public static polygon: FabricShapeType = 4;
    public static text: FabricShapeType = 5;
    public static image: FabricShapeType = 6;
    public static triangle: FabricShapeType = 7;
    public static path: FabricShapeType = 8;
    public static polyline: FabricShapeType = 9;
    public static line: FabricShapeType = 10;
}

export interface IFabricShape {
    shapeNodeType: FabricShapeType;
    properties: { [k: string]: any };
}