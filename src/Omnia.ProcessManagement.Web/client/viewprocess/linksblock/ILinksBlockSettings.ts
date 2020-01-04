import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-links-block-settings")*/
export interface ILinksBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-links-block-settings': TsxAllowUnknowProperties<ILinksBlockSettingsComponent>;
        }
    }
}
