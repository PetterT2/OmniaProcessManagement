import { EnterprisePropertyDefinition } from '@omnia/fx-models';

/*@WebComponentInterface("opm-enterpriseproperties-process-display")*/
export interface IProcessFieldDisplay {
    /*@DomProperty*/
    property: EnterprisePropertyDefinition;

    /*@DomProperty*/
    model: any;

    /*@DomProperty*/
    wrapWithParentContent: (h: any, internalName: string, propertyContent: JSX.Element) => JSX.Element;
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