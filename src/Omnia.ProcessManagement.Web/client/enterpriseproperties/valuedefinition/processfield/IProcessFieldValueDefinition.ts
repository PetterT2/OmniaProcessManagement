import { EnterprisePropertyValueDefinitionProps } from '@omnia/fx/ux';

/*@WebComponentInterface("opm-enterpriseproperties-process-value-definition")*/
export interface IProcessFieldValueDefinition extends EnterprisePropertyValueDefinitionProps {

}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {

            /*@WebComponent*/
            "opm-enterpriseproperties-process-value-definition": IProcessFieldValueDefinition
        }
    }
}