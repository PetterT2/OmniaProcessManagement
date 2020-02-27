import { LightProcess } from '../../fx/models';
import { IValidator } from '@omnia/fx/ux';
import { GuidValue } from '@omnia/fx-models';

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
    model: Array<GuidValue>;

    /*@DomProperty*/
    onModelChange: (opmProcessIds: Array<GuidValue>) => void;

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