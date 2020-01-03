import { TsxAllowUnknowProperties } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-tasks-block-settings")*/
export interface ITasksBlockSettingsComponent {
    /*@DomProperty*/
    settingsKey: string;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            'opm-tasks-block-settings': TsxAllowUnknowProperties<ITasksBlockSettingsComponent>;
        }
    }
}
