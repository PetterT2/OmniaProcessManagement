import { TsxAllowUnknowProperties } from '@omnia/fx/ux';
import { DrawingShapeDefinition, CanvasDefinition } from '../../fx/models';
import { IShape } from '../../fx';


/*@WebComponentInterface("opm-freeform-picker")*/
export interface IFreeformPickerComponent {
    /*@DomProperty*/
    shapeDefinition: DrawingShapeDefinition;

    /*@DomProperty*/
    canvasDefinition: CanvasDefinition;

    /*@DomProperty*/
    closed: () => void;

    /*@DomProperty*/
    save: (shape: IShape) => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-freeform-picker": TsxAllowUnknowProperties<IFreeformPickerComponent>
        }
    }
}