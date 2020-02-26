
/*@WebComponentInterface("opm-enterpriseproperties-process-value-definition")*/
export interface IProcessFieldValueDefinition {
    /*@DomProperty*/
    model: any;

    disabled: boolean;
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