import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-breadcrumb-block-settings")*/
export interface IBreadcrumbBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-breadcrumb-block-settings': TsxAllowUnknowProperties<IBreadcrumbBlockSettingsComponent>;
        }
    }
}
