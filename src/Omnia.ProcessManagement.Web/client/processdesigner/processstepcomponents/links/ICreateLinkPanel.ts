import { TsxAllowUnknowProperties } from '@omnia/fx/ux';
import { Enums, Link } from '../../../fx/models';
import { GuidValue } from '@omnia/fx-models';

/*@WebComponentInterface("opm-processdesigner-createlink")*/
export interface ICreateLinkPanel {
    /*@DomProperty*/
    onClose: () => void;

    /*@DomProperty*/
    onSave: (link: Link) => void;

    /*@DomProperty*/
    linkType: Enums.LinkType;

    /*@DomProperty*/
    isProcessStepShortcut?: boolean;

    /*@DomProperty*/
    linkId?: GuidValue;

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-processdesigner-createlink": TsxAllowUnknowProperties<ICreateLinkPanel>
        }
    }
}