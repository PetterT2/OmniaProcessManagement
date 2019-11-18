import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessItem, ProcessItemTypes } from './ProcessItem';

export interface ExternalProcessItem extends ProcessItem {
    type: ProcessItemTypes.External;
    opmProcessId: GuidValue;
}