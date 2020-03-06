import { IValidator } from '@omnia/fx/ux';
import { Process } from '../../fx/models';

export interface IProcessPickerProperties {
    /**Required */
    required?: boolean;

    /**Label */
    label?: string;

    /**Multiple selection*/
    multiple?: boolean;

    /**Disabled */
    disabled?: boolean;

    /**Vuetify dark mode */
    dark?: boolean;

    /**Do not display in the select menu items that are already selected*/
    hideSelected?: boolean;

    /**Vuetify Text field fill mode*/
    filled?: boolean;
}

/*@WebComponentInterface("opm-process-picker")*/
export interface IProcessPicker extends IProcessPickerProperties {

    /*@DomProperty*/
    model?: Array<string> | string;

    /*@DomProperty*/
    onModelChange: (processes: Array<Process>) => void;

    /*@DomProperty*/
    validator?: IValidator;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {

            /*@WebComponent*/
            "opm-process-picker": IProcessPicker
        }
    }
}