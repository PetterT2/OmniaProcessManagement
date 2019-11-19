import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("odm-admin-settings-documenttype-itemsettings-journey")*/
export interface IProcessTypeItemSettingsJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-settings-processtype-itemsettings-journey": TsxAllowUnknowProperties<IProcessTypeItemSettingsJourney>
        }
    }
}