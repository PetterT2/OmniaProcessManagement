import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { EnterprisePropertyDisplayProps } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-enterpriseproperties-process-display")*/
export interface IProcessFieldDisplay extends EnterprisePropertyDisplayProps {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {

            /*@WebComponent*/
            "opm-enterpriseproperties-process-display": IProcessFieldDisplay
        }
    }
}