import { TsxAllowUnknowProperties, IValidator } from '@omnia/fx/ux'
import { MultilingualString } from '@omnia/fx-models';

export interface IAddLinkedProcessAttributes {

}

/*@WebComponentInterface("opm-processdesigner-addlinkedprocess")*/
export interface IAddLinkedProcess extends IAddLinkedProcessAttributes {
    /*@DomProperty*/
    onChange: (title: MultilingualString) => void;
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