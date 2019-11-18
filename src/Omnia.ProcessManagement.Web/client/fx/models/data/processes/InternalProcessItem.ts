import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessItem, ProcessItemTypes } from './ProcessItem';

export interface InternalProcessItem extends ProcessItem {
    type: ProcessItemTypes.Internal;
    children: Array<ProcessItem>;
    processMetadataId: GuidValue;
}