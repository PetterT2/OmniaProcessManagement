export class FabricShapeTypes {
    public static circle: FabricShapeTypes = 1;
    public static ellipse: FabricShapeTypes = 2;
    public static rect: FabricShapeTypes = 3;
    public static polygon: FabricShapeTypes = 4;
    public static text: FabricShapeTypes = 5;
    public static image: FabricShapeTypes = 6;
    public static triangle: FabricShapeTypes = 7;
    public static path: FabricShapeTypes = 8;
    public static polyline: FabricShapeTypes = 9;
    public static line: FabricShapeTypes = 10;
}

export interface IFabricShape {
    shapeNodeType: FabricShapeTypes;
    properties: { [k: string]: any };
}