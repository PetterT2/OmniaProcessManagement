import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricShape, FabricCircleShape, IFabricShape, FabricImageShape } from '../fabricshape';
import { IShape } from './IShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { DrawingImageShapeDefinition, TextPosition, DrawingShapeDefinition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class MediaShape extends ShapeExtension implements Shape {
    left: number;
    top: number;

    constructor(definition: DrawingImageShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Media.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let fabricImageObj = this.fabricShapes.find(f => f.shapeNodeType == FabricShapeTypes.image);
            if (fabricImageObj) {
                (fabricImageObj as FabricImageShape).ready()
                    .then((result) => {
                        let newWidth = fabricImageObj.properties.width * (fabricImageObj.properties.scaleX || 1);
                        let newHeight = fabricImageObj.properties.height * (fabricImageObj.properties.scaleY || 1);
                        if (this.definition.height != newHeight ||
                            this.definition.width != newWidth) {
                            this.definition.width = newWidth;
                            this.definition.height = newHeight;
                            let position = this.correctPosition(this.left, this.top);
                            let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, true);
                            this.fabricShapes[1].fabricObject.top = textPosition.top;
                            this.fabricShapes[1].fabricObject.left = textPosition.left;
                        }
                        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
                        resolve(true);
                    }).catch(() => {
                        reject();
                    });
            }
        })
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.left = left;
        this.top = top;
        if (this.nodes) {
            let imageNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.image);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (imageNode) {
                this.fabricShapes.push(new FabricImageShape((this.definition as DrawingImageShapeDefinition), Object.assign({ selectable: selectable }, imageNode.properties || {})));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: 'center', selectable: false }, textNode.properties) || {}, title));
            }
        }
        else if (this.definition) {
            let position = this.correctPosition(left, top);
            let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, true);
            this.fabricShapes.push(new FabricImageShape((this.definition as DrawingImageShapeDefinition), { left: position.left, top: position.top, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: false }, title));
        }
    }

}
