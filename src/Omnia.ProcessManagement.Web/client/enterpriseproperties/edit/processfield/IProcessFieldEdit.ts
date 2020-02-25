import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { IValidator } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-enterpriseproperties-process-edit")*/
export interface IProcessFieldEdit {
    /*@DomProperty*/
    property: EnterprisePropertyDefinition;

    /*@DomProperty*/
    model: any;

    disabled: boolean;

    dark?: boolean;

    required?: boolean;

    useValidator?: IValidator;

    includeTime?: boolean;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {

            /*@WebComponent*/
            "opm-enterpriseproperties-process-edit": IProcessFieldEdit
        }
    }
}