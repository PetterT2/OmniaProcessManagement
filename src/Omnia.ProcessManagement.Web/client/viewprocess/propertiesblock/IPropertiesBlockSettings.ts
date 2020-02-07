import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-properties-block-settings")*/
export interface IPropertiesBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-properties-block-settings': TsxAllowUnknowProperties<IPropertiesBlockSettingsComponent>;
        }
    }
}
