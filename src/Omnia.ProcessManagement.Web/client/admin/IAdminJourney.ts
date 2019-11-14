import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("opm-admin-journey")*/
export interface IAdminJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-journey": TsxAllowUnknowProperties<IAdminJourney>
        }
    }
}