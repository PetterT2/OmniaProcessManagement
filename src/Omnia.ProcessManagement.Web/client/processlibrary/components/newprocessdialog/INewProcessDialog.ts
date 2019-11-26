import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

export interface INewProcessDialogAttributes {

}

/*@WebComponentInterface("opm-new-process-dialog")*/
export interface INewProcessDialog extends INewProcessDialogAttributes {
    /*@DomProperty*/
    closeCallback: (isUpdate: boolean) => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-new-process-dialog": TsxAllowUnknowProperties<INewProcessDialog>
        }
    }
}