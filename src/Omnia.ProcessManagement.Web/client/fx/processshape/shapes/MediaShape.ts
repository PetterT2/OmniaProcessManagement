import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricShape, FabricCircleShape, IFabricShape, FabricImageShape } from '../fabricshape';
import { IShape } from './IShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class MediaShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Media.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let fabricImageObj = this.fabricShapes.find(f => f.shapeNodeType == FabricShapeTypes.image);
            if (fabricImageObj) {
                (fabricImageObj as FabricImageShape).ready()
                    .then(() => {
                        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
                        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
                        resolve(true);
                    }).catch(() => {
                        reject();
                    });
            }
        })
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            let imageNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.image);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (imageNode) {
                this.fabricShapes.push(new FabricImageShape(this.definition, isActive, Object.assign({ selectable: selectable }, imageNode.properties || {})));
            }
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties) || {}, title));
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let cleft = left, ctop = top, tleft = left + Math.floor(this.definition.width / 2), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(this.definition.height / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.height + TextSpacingWithShape;
                    break;
                default:
                    ctop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricImageShape(this.definition, isActive, { left: cleft, top: ctop, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: false }, title));
        }

    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShapeJson(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [],
            definition: this.definition
        }
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        if (this.fabricObjects.length < 2 || this.fabricObjects.findIndex(f => f == null) > -1)
            return;
        let left = this.fabricObjects[1].left; let top = this.fabricObjects[1].top;
        let left0 = this.fabricObjects[0].left; let top0 = this.fabricObjects[0].top;
        this.fabricObjects[0].on({
            "mousedown": (e) => {
                this.startPoint = canvas.getPointer(e.e);
                this.originPos = { x: this.fabricObjects[1].left, y: this.fabricObjects[1].top };
            },
            "moving": (e) => {
                var currPos = canvas.getPointer(e.e),
                    moveX = currPos.x - this.startPoint.x,
                    moveY = currPos.y - this.startPoint.y;

                if (gridX)
                    this.fabricObjects[1].set({
                        left: Math.round(this.fabricObjects[0].left / gridX) * gridX - left0 + left
                    });
                else
                    this.fabricObjects[1].set({
                        left: this.originPos.x + moveX
                    });

                if (gridY)
                    this.fabricObjects[1].set({
                        top: Math.round(this.fabricObjects[0].top / gridY) * gridY - top0 + top
                    });
                else
                    this.fabricObjects[1].set({
                        top: this.originPos.y + moveY
                    });

                this.fabricObjects[1].setCoords();
            },
            "scaling": (p) => {

            }
        })

    }
}
