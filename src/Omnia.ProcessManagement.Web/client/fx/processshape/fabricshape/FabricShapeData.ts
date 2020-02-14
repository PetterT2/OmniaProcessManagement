export class FabricShapeDataTypes {
    public static circle: FabricShapeDataTypes = 1;
    public static ellipse: FabricShapeDataTypes = 2;
    public static rect: FabricShapeDataTypes = 3;
    public static polygon: FabricShapeDataTypes = 4;
    public static text: FabricShapeDataTypes = 5;
    public static image: FabricShapeDataTypes = 6;
    public static triangle: FabricShapeDataTypes = 7;
    public static path: FabricShapeDataTypes = 8;
    public static polyline: FabricShapeDataTypes = 9;
    public static line: FabricShapeDataTypes = 10;
}

export interface FabricShapeData {
    fabricShapeDataType: FabricShapeDataTypes;
    properties: { [k: string]: any };
}