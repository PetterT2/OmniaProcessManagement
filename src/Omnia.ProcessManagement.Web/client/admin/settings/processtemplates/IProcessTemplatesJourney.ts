import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("opm-admin-settings-process-templates-journey")*/
export interface IProcessTemplatesJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-settings-process-templates-journey": TsxAllowUnknowProperties<IProcessTemplatesJourney>
        }
    }
}