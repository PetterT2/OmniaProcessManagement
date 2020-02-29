import { TsxAllowUnknowProperties } from '@omnia/fx/ux';
import { SpacingSettings, LanguageTag } from '@omnia/fx-models';
import { ProcessLibraryViewSettings } from '../../../fx/models';

/*@WebComponentInterface("opm-process-library-list-view")*/
export interface IListViewComponent {
    /*@DomProperty*/
    viewSettings: ProcessLibraryViewSettings;

    /*@DomProperty*/
    SpacingSettings?: SpacingSettings;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-process-library-list-view": TsxAllowUnknowProperties<IListViewComponent>
        }
    }
}