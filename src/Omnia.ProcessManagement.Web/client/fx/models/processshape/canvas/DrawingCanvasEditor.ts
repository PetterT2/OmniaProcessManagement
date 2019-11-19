import { fabric } from 'fabric';
import { Guid } from '@omnia/fx-models';
import { CanvasDefinition } from '../../data/drawingdefinitions';
import { DrawingCanvas } from './DrawingCanvas';

export class DrawingCanvasEditor extends DrawingCanvas implements CanvasDefinition {
    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        super(elementId, options, definition);
    }

    protected initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.selectable = true;
        this.canvasObject = new fabric.Canvas(elementId, options);
        if (definition) {
            this.width = definition.width;
            this.height = definition.height;
            this.gridX = definition.gridX;
            this.gridY = definition.gridY;

            this.canvasObject.setWidth(definition.width);
            this.canvasObject.setHeight(definition.height);
            if (definition.gridX) {
                for (var i = 0; i < (definition.width / definition.gridX); i++) {
                    this.canvasObject.add(new fabric.Line([i * definition.gridX, 0, i * definition.gridX, definition.width], { stroke: '#ccc', selectable: false }));
                }
            }
            if (definition.gridY) {
                for (var i = 0; i < (definition.height / definition.gridY); i++) {
                    this.canvasObject.add(new fabric.Line([0, i * definition.gridY, definition.height, i * definition.gridY], { stroke: '#ccc', selectable: false }))
                }
            }

            if (definition.drawingShapes) {
                definition.drawingShapes.forEach(s => {
                    this.addShapeFromTemplateClassName(s.shape.name, Guid.newGuid(), s.shape.nodes, null);
                })
            }
            this.addEventListener();
        }
    }

    private addEventListener() {
        this.canvasObject.on('object:moving', (options) => {
            if (options.target.type != 'text') {
                if (this.gridX)
                    options.target.set({
                        left: Math.round(options.target.left / this.gridX) * this.gridX
                    });
                if (this.gridY)
                    options.target.set({
                        top: Math.round(options.target.top / this.gridY) * this.gridY
                    });
            }
        });
    }

}
