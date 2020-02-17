import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { GuidValue } from '@omnia/fx-models';
import { Process } from '../../fx/models';


/*@WebComponentInterface("opm-unpublish-process-dialog")*/
export interface IUnpublishProcessDialog {
    /*@DomProperty*/
    process: Process;

    /*@DomProperty*/
    unpublishHandler?: () => void;

    /*@DomProperty*/
    closeCallback: (unpublished: boolean) => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-unpublish-process-dialog": TsxAllowUnknowProperties<IUnpublishProcessDialog>
        }
    }
}