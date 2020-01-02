import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-drawing-block-settings")*/
export interface IDrawingBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-drawing-block-settings': TsxAllowUnknowProperties<IDrawingBlockSettingsComponent>;
        }
    }
}
