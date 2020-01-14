import { fabric } from 'fabric';
import { Shape } from './Shape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { IShape } from './IShape';
import { IFabricShape, FabricShape, FabricShapeTypes } from '../fabricshape';
import { MultilingualString } from '@omnia/fx-models';
import { TextSpacingWithShape } from '../../constants';
import { Utils } from '@omnia/fx';

export class ShapeExtension implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IFabricShape[];
    left: number;
    top: number;
    protected fabricShapes: Array<FabricShape> = [];
    private startPoint: { x: number, y: number } = { x: 0, y: 0 };
    private originPos: { x: number, y: number } = { x: 0, y: 0 };
    private originShapePos: { x: number, y: number } = { x: 0, y: 0 };
    private allowSetHover: boolean = false;
    private isHovering: boolean = false;
    private isSelected: boolean = false;

    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number) {
        this.left = left;
        this.top = top;
        definition.width = definition.width ? parseFloat(definition.width.toString()) : 0;
        definition.height = definition.height ? parseFloat(definition.height.toString()) : 0;
        definition.fontSize = definition.fontSize ? parseFloat(definition.fontSize.toString()) : 0;
        this.definition = definition;
        this.nodes = nodes;
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        this.initNodes(title, selectable, left, top);
    }

    get name() {
        return "";
    }

    setAllowHover(allowSetHover: boolean) {
        this.allowSetHover = allowSetHover;
    }

    isHover() {
        return this.isHovering;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    protected initNodes(title?: MultilingualString | string, selectable?: boolean, left?: number, top?: number) {
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricShapes.map(f => f.fabricObject);
    }

    protected getShapes(): IFabricShape[] {
        return this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [];
    }

    getShapeJson(): IShape {
        let nodes = this.getShapes();
        this.definition = this.ensureDefinition(nodes);
        return {
            name: this.name,
            nodes: nodes,
            definition: this.definition,
            left: this.left,
            top: this.top
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

    protected finishScaling(object: fabric.Object) {
        let position = this.correctPosition(object.left, object.top);
        let textPosition = this.getTextPosition(position, Math.floor(object.width * object.scaleX), Math.floor(object.height * object.scaleY), true);
        this.fabricShapes[1].fabricObject.set({
            left: textPosition.left,
            top: textPosition.top
        });
    }

    protected correctPosition(left: number, top: number): { left: number, top: number } {
        left = left || 0; top = top || 0;
        left = parseFloat(left.toString());
        top = parseFloat(top.toString());
        return { left: left, top: top };
    }

    getTextPosition(position: { left: number, top: number }, width: number, height: number, isCenter?: boolean) {
        let tleft = isCenter ? position.left + Math.floor(width / 2) : position.left + TextSpacingWithShape, ttop = position.top;
        switch (this.definition.textPosition) {
            case TextPosition.Center:
                ttop += Math.floor(height / 2 - this.definition.fontSize / 2 - 2);
                break;
            case TextPosition.Bottom:
                ttop += height + TextSpacingWithShape;
                break;
            default:
                ttop -= this.definition.fontSize + TextSpacingWithShape;
                break;
        }
        return { left: tleft, top: ttop };
    }

    setSelectedShape(isSelected: boolean) {
        this.isSelected = isSelected;
        this.setHover(this.shapeObject, false);
    }

    private setHover(objects: fabric.Object[], isActive: boolean) {
        this.isHovering = isActive;
        objects.forEach((object) => {
            if (object.type == 'text')
                object.set({
                    fill: isActive || this.isSelected ? this.definition.activeTextColor : this.definition.textColor
                });
            else
                object.set({
                    fill: isActive || this.isSelected ? this.definition.activeBackgroundColor : this.definition.backgroundColor,
                    stroke: isActive || this.isSelected ? this.definition.activeBorderColor : this.definition.borderColor
                });
        });
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        if (this.shapeObject.length < 2 || this.shapeObject.findIndex(f => f == null) > -1)
            return;

        this.shapeObject[0].on({
            "mousedown": (e) => {
                this.startPoint = canvas.getPointer(e.e);
                this.originPos = { x: this.shapeObject[1].left, y: this.shapeObject[1].top };
                this.originShapePos = { x: this.shapeObject[0].left, y: this.shapeObject[0].top };
            },
            "moving": (e) => {
                var currPos = canvas.getPointer(e.e),
                    moveX = currPos.x - this.startPoint.x,
                    moveY = currPos.y - this.startPoint.y;
                let tleft = gridX ? Math.round(this.shapeObject[0].left / gridX) * gridX - this.originShapePos.x + this.originPos.x : this.originPos.x + moveX;
                let ttop = gridY ? Math.round(this.shapeObject[0].top / gridY) * gridY - this.originShapePos.y + this.originPos.y : this.originPos.y + moveY;
                this.shapeObject[1].set({
                    left: tleft,
                    top: ttop
                });

                this.shapeObject[1].setCoords();
            },
            "scaling": (e) => {
                this.finishScaling(e.target);
            },
            "mouseover": (e) => {
                if (this.allowSetHover) {
                    this.setHover(this.shapeObject, true);
                    canvas.renderAll();
                }
            },
            "mouseout": (e) => {
                if (this.allowSetHover) {
                    this.setHover(this.shapeObject, false);
                    canvas.renderAll();
                }
            }
        })
        this.shapeObject[1].on({
            "mousedown": (e) => {
                this.startPoint = canvas.getPointer(e.e);
                this.originPos = { x: this.shapeObject[1].left, y: this.shapeObject[1].top };
                this.originShapePos = { x: this.shapeObject[0].left, y: this.shapeObject[0].top };
            },
            "moving": (e) => {
                var currPos = canvas.getPointer(e.e),
                    moveX = currPos.x - this.startPoint.x,
                    moveY = currPos.y - this.startPoint.y;
                let left = this.originShapePos.x + moveX;
                let top = this.originShapePos.y + moveY;
                let tleft = gridX ? Math.round(left / gridX) * gridX : left;
                let ttop = gridY ? Math.round(top / gridY) * gridY : top;
                this.shapeObject[0].set({
                    left: tleft,
                    top: ttop
                });
                if (gridX) {
                    this.shapeObject[1].set({
                        left: Math.round(this.shapeObject[0].left / gridX) * gridX - this.originShapePos.x + this.originPos.x,
                    });
                }
                if (gridY) {
                    this.shapeObject[1].set({
                        top: Math.round(this.shapeObject[0].top / gridY) * gridY - this.originShapePos.y + this.originPos.y
                    });
                }
                if (gridX || gridY)
                    this.shapeObject[1].setCoords();
                this.shapeObject[0].setCoords();
            },
            "mouseover": (e) => {
                if (this.allowSetHover) {
                    this.setHover(this.shapeObject, true);
                    canvas.renderAll();
                }
            },
            "mouseout": (e) => {
                if (this.allowSetHover) {
                    this.setHover(this.shapeObject, false);
                    canvas.renderAll();
                }
            }
        })
    }
}
