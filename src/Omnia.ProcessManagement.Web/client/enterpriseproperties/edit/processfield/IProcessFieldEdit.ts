import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { IValidator, EnterprisePropertyEditProps } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-enterpriseproperties-process-edit")*/
export interface IProcessFieldEdit extends EnterprisePropertyEditProps {

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