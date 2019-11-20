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
        this.renderGridView(elementId, options, definition);
        this.addEventListener();
    }

    private addEventListener() {
        if (this.canvasObject == null)
            return;
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
