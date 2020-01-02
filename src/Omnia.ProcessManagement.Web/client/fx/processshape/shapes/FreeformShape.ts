import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricTextShape, IFabricShape, FabricShapeTypes, FabricPathShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Freeform.name;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        if (this.nodes) {
            let hasPosition = (left != null && left != undefined) && (top != null && top != undefined);
            if (hasPosition) {
                left = parseFloat(left.toString());
                top = parseFloat(top.toString());
            }
            let pathNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.path);
            if (pathNode) {
                if (hasPosition) {
                    pathNode.properties['left'] = left;
                    pathNode.properties['top'] = top;
                }
                this.fabricShapes.push(new FabricPathShape(this.definition, Object.assign({ selectable: selectable }, pathNode.properties || {}), true));
                let textTop = this.fabricShapes[0].fabricObject.top;
                if (this.definition.textPosition == TextPosition.Above) {
                    if (this.fabricShapes[0].fabricObject.top == undefined || this.fabricShapes[0].fabricObject.top < TextSpacingWithShape + this.definition.fontSize)
                        this.fabricShapes[0].fabricObject.set({ top: this.fabricShapes[0].fabricObject.top + TextSpacingWithShape + this.definition.fontSize });
                    else
                        textTop = this.fabricShapes[0].fabricObject.top - (TextSpacingWithShape + this.definition.fontSize);
                }
                let textPosition = this.getObjectPosition(true, this.fabricShapes[0].fabricObject.left, textTop, this.fabricShapes[0].fabricObject.width, this.fabricShapes[0].fabricObject.height, true);
                this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', selectable: false, left: textPosition.left, top: textPosition.top }, title));
            }
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
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
