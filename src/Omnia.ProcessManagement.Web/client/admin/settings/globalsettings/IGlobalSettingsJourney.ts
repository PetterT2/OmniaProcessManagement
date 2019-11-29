import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("opm-admin-settings-globalsettings-journey")*/
export interface IGlobalSettingsJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-settings-globalsettings-journey": TsxAllowUnknowProperties<IGlobalSettingsJourney>
        }
    }
}