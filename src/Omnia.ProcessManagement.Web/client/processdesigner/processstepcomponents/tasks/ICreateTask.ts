import { TsxAllowUnknowProperties } from '@omnia/fx/ux';
import { Enums, Task } from '../../../fx/models';
import { GuidValue } from '@omnia/fx-models';

/*@WebComponentInterface("opm-processdesigner-createtask")*/
export interface ICreateTask {
    /*@DomProperty*/
    onClose: () => void;

    /*@DomProperty*/
    onSave: (task: Task) => void;

    /*@DomProperty*/
    taskId?: GuidValue;

    /*@DomProperty*/
    isProcessStepShortcut?: boolean;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-processdesigner-createtask": TsxAllowUnknowProperties<ICreateTask>
        }
    }
}