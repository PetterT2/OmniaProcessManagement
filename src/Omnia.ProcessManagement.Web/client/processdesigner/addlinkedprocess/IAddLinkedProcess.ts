import { TsxAllowUnknowProperties, IValidator } from '@omnia/fx/ux'
import { GuidValue, MultilingualString } from '@omnia/fx-models'

export interface IAddLinkedProcessAttributes {

}

/*@WebComponentInterface("opm-processdesigner-addlinkedprocess")*/
export interface IAddLinkedProcess extends IAddLinkedProcessAttributes {
    /*@DomProperty*/
    opmProcessId?: GuidValue;

    /*@DomProperty*/
    onChange: (title: MultilingualString, opmProcessId: GuidValue) => void
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-processdesigner-addlinkedprocess": TsxAllowUnknowProperties<IAddLinkedProcess>
        }
    }
}