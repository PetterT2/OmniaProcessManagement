import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("opm-admin-settings-process-types-journey")*/
export interface IProcessTypesJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-settings-process-types-journey": TsxAllowUnknowProperties<IProcessTypesJourney>
        }
    }
}