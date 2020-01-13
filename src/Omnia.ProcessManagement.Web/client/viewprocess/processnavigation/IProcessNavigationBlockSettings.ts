import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-processnavigation-block-settings")*/
export interface IProcessNavigationBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-processnavigation-block-settings': TsxAllowUnknowProperties<IProcessNavigationBlockSettingsComponent>;
        }
    }
}
