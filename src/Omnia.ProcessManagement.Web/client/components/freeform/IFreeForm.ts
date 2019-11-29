import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { CanvasDefinition, DrawingShapeDefinition } from '../../fx/models';

export interface IFreeFormAttributes {
    
}

/*@WebComponentInterface("opm-free-form")*/
export interface IFreeForm extends IFreeFormAttributes {
    /*@DomProperty*/
    shapeDefinition: DrawingShapeDefinition;

    /*@DomProperty*/
    onSaved: () => void;

    /*@DomProperty*/
    onClosed?: () => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-free-form": TsxAllowUnknowProperties<IFreeForm>
        }
    }
}