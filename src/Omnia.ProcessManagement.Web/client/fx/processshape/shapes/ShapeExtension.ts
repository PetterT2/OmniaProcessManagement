import { fabric } from 'fabric';
import { Shape } from './Shape';
import { DrawingShapeDefinition, TextPosition, TextAlignment, DrawingPentagonShapeDefinition } from '../../models';
import { ShapeObject } from './ShapeObject';
import { FabricShapeData, FabricShape, FabricShapeDataTypes, FabricTextShape } from '../fabricshape';
import { MultilingualString } from '@omnia/fx-models';
import { TextSpacingWithShape, ShapeHighlightProperties } from '../../constants';
import { Utils, ServiceContainer } from '@omnia/fx';
import { CurrentProcessStore } from '../../stores';

export class ShapeExtension implements Shape {
    definition: DrawingShapeDefinition;
    nodes: FabricShapeData[];
    left: number;
    top: number;
    protected fabricShapes: Array<FabricShape> = [];
    private startPoint: { x: number, y: number } = { x: 0, y: 0 };
    private originPos: { x: number, y: number } = { x: 0, y: 0 };
    private originShapePos: { x: number, y: number } = { x: 0, y: 0 };
    private allowSetHover: boolean = false;
    private isHovering: boolean = false;
    private isHovered: boolean = false;
    private isSelected: boolean = false;
    private darkHighlight?: boolean;

    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
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
        this.darkHighlight = darkHighlight;

        this.initNodes(title, selectable, left, top);
    }

    get shapeTemplateTypeName() {
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

    public updateShapeDefinition(definition: DrawingShapeDefinition, title: MultilingualString) {
        if (this.fabricShapes.length < 2)
            return;
        this.definition = definition;
        this.fabricShapes[0].updateDefinition(this.definition, {});
        let textPosition = ShapeExtension.getTextPosition(this.definition, this.fabricShapes[0].fabricObject.getCenterPoint());
        (this.fabricShapes[1] as FabricTextShape).updateDefinition(this.definition, {
            left: textPosition.left,
            top: textPosition.top,
            originX: this.definition.textAlignment
        }, title);
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricShapes.map(f => f.fabricObject);
    }

    protected getShapes(): FabricShapeData[] {
        return this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [];
    }

    getShapeJson(): ShapeObject {
        let nodes = this.getShapes();
        this.definition = this.ensureDefinition(nodes);
        return {
            shapeTemplateTypeName: this.shapeTemplateTypeName,
            nodes: nodes,
            definition: this.definition,
            left: this.fabricShapes[0].fabricObject.left,
            top: this.fabricShapes[0].fabricObject.top
        }
    }

    protected ensureDefinition(jsonNodes: Array<FabricShapeData>) {
        if (jsonNodes) {
            let drawingNode = jsonNodes.find((item) => item.fabricShapeDataType != FabricShapeDataTypes.text);
            if (drawingNode) {
                this.definition.width = drawingNode.properties.width;
                this.definition.height = drawingNode.properties.height;
            }
        }
        return this.definition;
    }

    protected getScalingSnapToGridAttrs(object: fabric.Object, gridX?: number, gridY?: number) {
        //reference solution: https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize
        //Don't have time to revisit this solution to improve it. its good to do that at some point.

        var target = object,
            w = target.width * target.scaleX,
            h = target.height * target.scaleY,
            snap = { // Closest snapping points
                top: Math.round(target.top / gridY) * gridY,
                left: Math.round(target.left / gridX) * gridX,
                bottom: Math.round((target.top + h) / gridY) * gridY,
                right: Math.round((target.left + w) / gridX) * gridX
            },
            dist = { // Distance from snapping points
                top: Math.abs(snap.top - target.top),
                left: Math.abs(snap.left - target.left),
                bottom: Math.abs(snap.bottom - target.top - h),
                right: Math.abs(snap.right - target.left - w)
            },
            attrs = {
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                top: target.top,
                left: target.left
            };
        switch (target['__corner']) {
            case 'tl':
                if (dist.left < dist.top && dist.left < gridX) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                    attrs.left = snap.left;
                } else if (dist.top < gridY) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                    attrs.top = snap.top;
                }
                break;
            case 'mt':
                if (dist.top < gridY) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.top = snap.top;
                }
                break;
            case 'tr':
                if (dist.right < dist.top && dist.right < gridX) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                } else if (dist.top < gridY) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.top = snap.top;
                }
                break;
            case 'ml':
                if (dist.left < gridX) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.left = snap.left;
                }
                break;
            case 'mr':
                if (dist.right < gridX) attrs.scaleX = (snap.right - target.left) / target.width;
                break;
            case 'bl':
                if (dist.left < dist.bottom && dist.left < gridX) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.left = snap.left;
                } else if (dist.bottom < gridY) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                }
                break;
            case 'mb':
                if (dist.bottom < gridY) attrs.scaleY = (snap.bottom - target.top) / target.height;
                break;
            case 'br':
                if (dist.right < dist.bottom && dist.right < gridX) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                } else if (dist.bottom < gridY) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                }
                break;
        }
        return attrs;
    }

    protected onScaling(object: fabric.Object, gridX?: number, gridY?: number) {
        let target = object
        let attrs = this.getScalingSnapToGridAttrs(object, gridX, gridY);
        target.set(attrs);
        let position = this.correctPosition(attrs.left, attrs.top);
        let textPosition = ShapeExtension.getTextPosition(this.definition, object.getCenterPoint(), Math.floor(object.width * attrs.scaleX), Math.floor(object.height * attrs.scaleY));

        this.fabricShapes[1].fabricObject.set({
            left: Math.round(textPosition.left),
            top: Math.round(textPosition.top),
            originX: this.definition.textAlignment
        });
    }

    protected getHighlightProperties() {
        let properties = {};
        if (this.darkHighlight == true) {
            properties = ShapeHighlightProperties.dark
        }
        else if (this.darkHighlight == false) {
            properties = ShapeHighlightProperties.light
        }
        return properties;
    }

    protected correctPosition(left: number, top: number): { left: number, top: number } {
        left = left || 0; top = top || 0;
        left = parseFloat(left.toString());
        top = parseFloat(top.toString());
        return { left: left, top: top };
    }

    public updateShapePosition() {
        if (this.shapeObject.length == 0)
            return null;
        var shapeBound = this.shapeObject[0].getBoundingRect();
        var textBound = this.shapeObject[1].getBoundingRect();

        var minLeft = Math.min(shapeBound.left, textBound.left);
        var minTop = Math.min(shapeBound.top, textBound.top);
        var shapeLeft = Math.floor(this.shapeObject[0].left - minLeft);
        var shapeTop = Math.floor(this.shapeObject[0].top - minTop);
        var textLeft = Math.floor(this.shapeObject[1].left - minLeft);
        var textTop = Math.floor(this.shapeObject[1].top - minTop);
        this.shapeObject[0].set({ left: Math.round(shapeLeft), top: Math.round(shapeTop) });
        this.shapeObject[0].setCoords();
        this.shapeObject[1].set({ left: Math.round(textLeft), top: Math.round(textTop) });
        this.shapeObject[1].setCoords();
        let extendWidth = !Utils.isNullOrEmpty(this.definition.borderColor) ? 2 : 0;
        return {
            height: Math.round(Math.max(shapeBound.height + shapeBound.top - minTop, textBound.height + textBound.top - minTop) + extendWidth),
            width: Math.round(Math.max(shapeBound.width + shapeBound.left - minLeft, textBound.width + textBound.left - minLeft + extendWidth))
        }

    }

    public static getTextPosition(definition: DrawingShapeDefinition, centerPoint?: fabric.Point, left?: number, top?: number, width?: number, height?: number) {
        if ((definition as DrawingPentagonShapeDefinition).isLine && definition.height > 5)
            definition.height = 5;
        width = width || definition.width;
        height = height || definition.height;
        left = left || 0;
        top = top || 0;
        if (!centerPoint)
            centerPoint = new fabric.Point(width / 2 + left, height / 2 + top);
        let tleft = centerPoint.x;
        let ttop = centerPoint.y;

        var xAdjustment = definition.textHorizontalAdjustment || 0;
        var yAdjustMent = definition.textVerticalAdjustment || 0;
        var widthSpace = Math.floor(width / 2);
        var heightSpace = Math.floor(height / 2);
        switch (definition.textAlignment) {
            case TextAlignment.Right:
                tleft = centerPoint.x + widthSpace;
                break;
            case TextAlignment.Left:
                tleft = centerPoint.x - widthSpace;
                break;
            default:
                tleft = centerPoint.x;
                break;
        }

        switch (definition.textPosition) {
            case TextPosition.Above:
                ttop -= definition.fontSize + TextSpacingWithShape + heightSpace;
                break;
            case TextPosition.Bottom:
                ttop += heightSpace + TextSpacingWithShape;
                break;
            default:
                ttop -= Math.floor(definition.fontSize / 2);
                break;
        }
        return { left: tleft + xAdjustment, top: ttop + yAdjustMent };
    }

    setSelectedShape(isSelected: boolean) {
        this.isSelected = isSelected;
        this.setSelected(this.shapeObject);
    }

    private setSelected(objects: fabric.Object[]) {
        objects.forEach((object) => {
            if (object.type == 'text') {
                object.set({
                    fill: this.isSelected && this.definition.selectedTextColor ? this.definition.selectedTextColor : this.definition.textColor
                });
            }
            else {
                let stroke: string = this.isSelected && this.definition.selectedBorderColor ? this.definition.selectedBorderColor : this.definition.borderColor;

                let strokeProperties = {};
                if (!this.isSelected || !stroke) {
                    strokeProperties = this.getHighlightProperties();
                }

                object.set(Object.assign({
                    fill: this.isSelected && this.definition.selectedBackgroundColor ? this.definition.selectedBackgroundColor : this.definition.backgroundColor,
                    stroke: stroke
                }, strokeProperties));
            }
        });
    }

    private setHover(objects: fabric.Object[], isActive: boolean) {
        if (this.isSelected)
            return;
        this.isHovering = isActive;
        objects.forEach((object) => {
            if (object.type == 'text') {
                object.set({
                    fill: (isActive || this.isHovered) && this.definition.hoverTextColor ? this.definition.hoverTextColor : this.definition.textColor
                });
            }
            else {
                let stroke: string = (isActive || this.isHovered) && this.definition.hoverBorderColor ? this.definition.hoverBorderColor : this.definition.borderColor;

                let strokeProperties = {};
                if (!isActive || !stroke) {
                    strokeProperties = this.getHighlightProperties();
                }

                object.set(Object.assign({
                    fill: (isActive || this.isHovered) && this.definition.hoverBackgroundColor ? this.definition.hoverBackgroundColor : this.definition.backgroundColor,
                    stroke: stroke
                }, strokeProperties));
            }
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
                this.onScaling(e.target, gridX, gridY);
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
