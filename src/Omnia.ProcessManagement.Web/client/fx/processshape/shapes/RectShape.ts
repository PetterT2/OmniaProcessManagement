import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricShapeData, FabricRectShape } from '../fabricshape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplateType, DrawingRectShapeDefinition } from '../../models';
import { ShapeTemplatesConstants } from '../../constants';
import { ShapeObject } from '.';

export class RectShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingRectShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    getShapeJson(): ShapeObject {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.fabricShapeDataType != FabricShapeDataTypes.text) {
                    nodeItem.properties['rx'] = this.shapeObject[0]['rx'];
                    nodeItem.properties['ry'] = this.shapeObject[0]['ry'];
                }
            });
        }
        return basicShapeJSON;
    }

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.RoundedRect.settings.type];
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let highlightProperties = this.getHighlightProperties();
        let position = this.correctPosition(left, top);
        let textPosition = this.getTextPosition(position);

        if (this.nodes) {
            let rectNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.rect);
            let textNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.text);
            if (rectNode) {
                this.fabricShapes.push(new FabricRectShape(this.definition as DrawingRectShapeDefinition, Object.assign({}, rectNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            }
            if (textNode) {
                textPosition = this.getTextPositionAfterRotate(textPosition);
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title));
            }
        }
        else if (this.definition) {
            this.fabricShapes.push(new FabricRectShape(this.definition as DrawingRectShapeDefinition, Object.assign({ left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private updateRound(object: fabric.Object) {
        if ((this.definition as DrawingRectShapeDefinition).roundX) {
            object.width = object.width * object.scaleX;
            object.scaleX = 1;
            object.dirty = true;
        }
        if ((this.definition as DrawingRectShapeDefinition).roundY) {
            object.height = object.height * object.scaleY;
            object.scaleY = 1;
            object.dirty = true;
        }
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        super.addEventListener(canvas, gridX, gridY);
        this.shapeObject[0].on({
            "scaled": (e) => {
                this.updateRound(e.target);
            }
        })
    }
}
