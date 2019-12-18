import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { GuidValue } from '@omnia/fx-models';


/*@WebComponentInterface("opm-permission-dialog")*/
export interface IPermissionDialog {
    /*@DomProperty*/
    close: () => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-permission-dialog": TsxAllowUnknowProperties<IPermissionDialog>
        }
    }
}