import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessItem, ProcessItemTypes } from './ProcessItem';

export interface CustomLinkProcessItem extends ProcessItem {
    type: ProcessItemTypes.CustomLink;
    customLink: string;
}