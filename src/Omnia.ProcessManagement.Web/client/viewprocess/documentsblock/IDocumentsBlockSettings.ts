import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-documents-block-settings")*/
export interface IDocumentsBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-documents-block-settings': TsxAllowUnknowProperties<IDocumentsBlockSettingsComponent>;
        }
    }
}
