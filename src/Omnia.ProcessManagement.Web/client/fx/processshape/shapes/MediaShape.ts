import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricShapeData, FabricImageShape, FabricShape } from '../fabricshape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { DrawingImageShapeDefinition, ShapeTemplateType } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants } from '../../constants';
import { Utils } from '@omnia/fx';

export class MediaShape extends ShapeExtension implements Shape {
    left: number;
    top: number;

    constructor(definition: DrawingImageShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.Media.settings.type];
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let fabricImageObj = this.fabricShapes.find(f => f.fabricShapeDataType == FabricShapeDataTypes.image);
            if (fabricImageObj) {
                (fabricImageObj as FabricImageShape).ready()
                    .then((result) => {
                        this.updatePosition(fabricImageObj);
                        resolve(true);
                    }).catch(() => {
                        reject();
                    });
            }
        })
    }

    private updatePosition(fabricImageObj: FabricShape) {
        let newWidth = Math.floor(fabricImageObj.properties.width * (fabricImageObj.properties.scaleX || 1));
        let newHeight = Math.floor(fabricImageObj.properties.height * (fabricImageObj.properties.scaleY || 1));
        if ((this.definition.height != newHeight + 1 && this.definition.height != newHeight - 1) ||
            (this.definition.width != newWidth + 1 && this.definition.width != newWidth - 1)) {
            this.definition.width = newWidth;
            this.definition.height = newHeight;
            let position = this.correctPosition(this.left, this.top);
            let textPosition = ShapeExtension.getTextPosition(this.definition, fabricImageObj.fabricObject.getCenterPoint());
            this.fabricShapes[1].fabricObject.top = textPosition.top;
            this.fabricShapes[1].fabricObject.left = textPosition.left;
            this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
        }
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.left = left;
        this.top = top;
        let position = this.correctPosition(left, top);
        let textPosition = ShapeExtension.getTextPosition(this.definition);
        let highlightProperties = this.getHighlightProperties();

        if (this.nodes) {
            let imageNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.image);
            let textNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.text);
            if (imageNode) {
                this.fabricShapes.push(new FabricImageShape((this.definition as DrawingImageShapeDefinition), Object.assign({}, imageNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }) || {}, title));
            }
        }
        else if (this.definition) {
            this.fabricShapes.push(new FabricImageShape((this.definition as DrawingImageShapeDefinition), Object.assign({ left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

}
