import { Point } from '../../fx/models';
import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

export interface IPointPickerProperties {
    label: string;
}

/*@WebComponentInterface("opm-point-picker")*/
export interface IPointPicker extends IPointPickerProperties {
    /*@DomProperty*/
    model: Point

    /*@DomProperty*/
    onModelChange?: (model: Point) => void;

    // allow unknown elements like ref which is vue specific
    [name: string]: any;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-point-picker": TsxAllowUnknowProperties<IPointPicker>
        }
    }
}