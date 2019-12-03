import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { CanvasDefinition, DrawingShapeDefinition } from '../../fx/models';
import { IShape } from '../../fx';

export interface IFreeFormAttributes {
    
}

/*@WebComponentInterface("opm-free-form")*/
export interface IFreeForm extends IFreeFormAttributes {
    /*@DomProperty*/
    shapeDefinition: DrawingShapeDefinition;

    /*@DomProperty*/
    onSaved: (shape: IShape) => void;

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