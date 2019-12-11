import { TsxAllowUnknowProperties } from '@omnia/fx/ux'
import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep, ProcessStep, IdDict } from '../../fx/models';

export interface IProcessStepPickerAttributes {
    header: string;
}

/*@WebComponentInterface("opm-process-step-picker")*/
export interface IProcessStepPicker extends IProcessStepPickerAttributes {
    /*@DomProperty*/
    rootProcessStep: RootProcessStep;

    /*@DomProperty*/
    onSelected: (process: ProcessStep) => Promise<void>

    /*@DomProperty*/
    onClose: () => void

    /*@DomProperty*/
    hiddenProcessStepIdsDict?: IdDict<boolean>

    /*@DomProperty*/
    disabledProcessStepIdsDict?: IdDict<boolean>
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface ElementAttributesProperty { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-process-step-picker": TsxAllowUnknowProperties<IProcessStepPicker>
        }
    }
}