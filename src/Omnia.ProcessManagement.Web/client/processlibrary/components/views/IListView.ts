import { TsxAllowUnknowProperties } from '@omnia/fx/ux';
import { SpacingSetting, LanguageTag } from '@omnia/fx-models';
import { ProcessLibraryViewSettings } from '../../../fx/models';

/*@WebComponentInterface("opm-process-library-list-view")*/
export interface IListViewComponent {
    /*@DomProperty*/
    viewSettings: ProcessLibraryViewSettings;

    /*@DomProperty*/
    spacingSetting?: SpacingSetting;
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