import { fabric } from 'fabric';
import { Shape } from './Shape';
import { DrawingShapeDefinition } from '../../models';
import { IShape } from './IShape';
import { IFabricShape, FabricShape, FabricShapeType, FabricShapeTypes } from '../fabricshape';
import { MultilingualString } from '@omnia/fx-models';

export class ShapeExtension implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IFabricShape[];
    protected fabricShapes: Array<FabricShape> = [];
    protected fabricObjects: fabric.Object[] = [];
    protected startPoint: { x: number, y: number } = { x: 0, y: 0 };
    protected originPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        this.definition = definition;
        this.nodes = nodes;
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        this.initNodes(isActive || false, title, selectable, left, top);
    }

    get name() {
        return "";
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShapeJson(): IShape {
        let nodes = this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [];
        this.definition = this.ensureDefinition(nodes);

        return {
            name: this.name,
            nodes: nodes,
            definition: this.definition
        }
    }

    private ensureDefinition(jsonNodes: Array<IFabricShape>) {
        if (jsonNodes) {
            let drawingNode = jsonNodes.find((item) => item.shapeNodeType != FabricShapeTypes.text);
            if (drawingNode) {
                this.definition.width = drawingNode.properties.width;
                this.definition.height = drawingNode.properties.height;
            }
        }
        return this.definition;
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        if (this.fabricObjects.length < 2 || this.fabricObjects.findIndex(f => f == null) > -1)
            return;
        let left = this.fabricObjects[1].left; let top = this.fabricObjects[1].top;
        let left0 = this.fabricObjects[0].left; let top0 = this.fabricObjects[0].top;
        let scaleX0 = this.fabricObjects[0].scaleX;
        let scaleY0 = this.fabricObjects[0].scaleY;

        this.fabricObjects[0].on({
            "mousedown": (e) => {
                left = this.fabricObjects[1].left; top = this.fabricObjects[1].top;
                left0 = this.fabricObjects[0].left; top0 = this.fabricObjects[0].top;
                scaleX0 = this.fabricObjects[0].scaleX;
                scaleY0 = this.fabricObjects[0].scaleY;
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
            "scaling": (e) => {
                let isScaleLeft = e.target.left != left0 || e.target.top != top0;
                let oLeft = isScaleLeft ? (e.target.left - left0) / 2 + left : ((this.fabricObjects[0].scaleX - scaleX0) * this.fabricObjects[0].width) / 2 + left;
                if (this.fabricObjects[1].originX == 'left') {
                    oLeft = isScaleLeft ? (e.target.left - left0) + left : left;
                }
                this.fabricObjects[1].set({
                    left: oLeft,
                    top: isScaleLeft ? (e.target.top - top0) / 2 + top : ((this.fabricObjects[0].scaleY - scaleY0) * this.fabricObjects[0].height) / 2 + top
                });
            }
        })

    }

}
