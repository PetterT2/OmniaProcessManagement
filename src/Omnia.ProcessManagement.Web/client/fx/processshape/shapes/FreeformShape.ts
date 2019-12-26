import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricTextShape, IFabricShape, FabricShapeTypes, FabricPathShape, FabricPolylineShape, FabricLineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IShape } from './IShape';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Freeform.name;
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        let hasPosition = (left != null && left != undefined) && (top != null && top != undefined);
        if (hasPosition) {
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
        }
        if (this.nodes) {
            var fabricGroupObjects: fabric.Object[] = [];
            var fabricTextObject: fabric.Object;

            let pathNodes = this.nodes.filter(n => n.shapeNodeType == FabricShapeTypes.path);
            let polylineNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polyline);
            let lineNodes = this.nodes.filter(n => n.shapeNodeType == FabricShapeTypes.line);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text) || {
                shapeNodeType: FabricShapeTypes.text, properties: {}
            };

            if (polylineNode) {
                let rectShape = new FabricPolylineShape(this.definition, isActive, Object.assign({ selectable: selectable }, polylineNode.properties || {}));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (lineNodes.length > 0) {
                let lineDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
                lineDefinition.activeBorderColor = this.definition.activeBackgroundColor;
                lineDefinition.borderColor = this.definition.backgroundColor;

                lineNodes.forEach(p => {
                    let lineShape = new FabricLineShape(lineDefinition, isActive, Object.assign({ selectable: selectable, strokeWidth: 5 }, p.properties || {}));
                    this.fabricShapes.push(lineShape);
                    fabricGroupObjects.push(lineShape.fabricObject);
                })
            }
            if (pathNodes.length > 0) {
                pathNodes.forEach(p => {
                    let pathShape = new FabricPathShape(this.definition, isActive, Object.assign({ selectable: selectable }, p.properties || {}));
                    this.fabricShapes.push(pathShape);
                    fabricGroupObjects.push(pathShape.fabricObject);
                })
            }

            let group = new fabric.Group(fabricGroupObjects, Object.assign({ selectable: selectable }, hasPosition ? { left: left, top: top } : {}));
            this.fabricObjects.push(group);
            if (textNode) {
                let tleft = group.left + Math.floor(group.width / 2);
                let ttop = group.top;
                switch (this.definition.textPosition) {
                    case TextPosition.Center:
                        ttop += Math.floor(group.height / 2 - this.definition.fontSize / 2 - 2);
                        break;
                    case TextPosition.Bottom:
                        ttop += group.height + TextSpacingWithShape;
                        break;
                    default:
                        ttop = group.top - TextSpacingWithShape - this.definition.fontSize;
                        if (ttop <= 0) {
                            ttop = 0;
                            this.fabricObjects[0].top = this.fabricObjects[0].top + TextSpacingWithShape + this.definition.fontSize;
                        }
                        break;
                }
                let textShape = new FabricTextShape(this.definition, isActive, Object.assign(textNode.properties || {}, { originX: 'center', selectable: false, left: tleft, top: ttop }), title);
                this.fabricShapes.push(textShape);
                fabricTextObject = textShape.fabricObject;
                this.fabricObjects.push(fabricTextObject);
            }

        }
    }

    protected getShapes(): IFabricShape[] {
        if (this.fabricObjects && this.fabricObjects.length > 0) {
            this.left = this.fabricObjects[0].left;
            this.top = this.fabricObjects[0].top;
        }
        return this.fabricShapes ? this.fabricShapes.filter(s => s.shapeNodeType != FabricShapeTypes.line).map(n => n.getShapeNodeJson()) : [];
    }

    scalePointsToDefinition(scaleX: number, scaleY: number) {
        this.fabricShapes.forEach(s => {
            s.scalePointsToDefinition(scaleX, scaleY);
        })
    }
}
