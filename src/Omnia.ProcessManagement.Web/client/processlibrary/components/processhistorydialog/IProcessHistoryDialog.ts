import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { GuidValue } from '@omnia/fx-models';

export interface IProcessHistoryDialogAttributes {

}

/*@WebComponentInterface("opm-process-history-dialog")*/
export interface IProcessHistoryDialog extends IProcessHistoryDialogAttributes {
    /*@DomProperty*/
    opmProcessId: GuidValue;

    /*@DomProperty*/
    closeCallback: () => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-process-history-dialog": TsxAllowUnknowProperties<IProcessHistoryDialog>
        }
    }
}