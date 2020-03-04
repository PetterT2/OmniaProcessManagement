import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-process-context-block-settings")*/
export interface IProcessContextBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-process-context-block-settings': TsxAllowUnknowProperties<IProcessContextBlockSettingsComponent>;
        }
    }
}
