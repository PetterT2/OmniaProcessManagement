import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes } from './IFabricShape';
import { DrawingShapeDefinition } from '../../data';
import { FabricShape } from './FabricShape';

export class FabricTextShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        this.initTextProperties(definition, isActive);
    }

    private initTextProperties(definition: DrawingShapeDefinition, isActive: boolean) {
        if (definition) {
            this.properties["fontSize"] = definition.fontSize;
            this.properties["fill"] = isActive ? definition.activeTextColor : definition.textColor;
            this.properties["textAlign"] = 'center';
            this.properties["fontFamily"] = 'Roboto,Arial,sans-serif';
        }
        this.fabricObject = new fabric.Text(this.properties['text'] || "", this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.text;
    }
}