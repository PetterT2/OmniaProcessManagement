import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-title-block-settings")*/
export interface ITitleBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-title-block-settings': TsxAllowUnknowProperties<ITitleBlockSettingsComponent>;
        }
    }
}
