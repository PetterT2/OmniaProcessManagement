import { GuidValue } from '@omnia/fx-models';

export interface ProcessReference {
    processId: GuidValue;
    opmProcessId: GuidValue;
    //the process step that match to the current route
    processStepId: GuidValue;
    //a shortcut to another process step
    shortcutProcessStepId?: GuidValue;
}