import { TsxAllowUnknowProperties } from '@omnia/fx/ux'

/*@WebComponentInterface("opm-admin-settings-shape-gallery-journey")*/
export interface IShapeGalleryJourney {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-admin-settings-shape-gallery-journey": TsxAllowUnknowProperties<IShapeGalleryJourney>
        }
    }
}