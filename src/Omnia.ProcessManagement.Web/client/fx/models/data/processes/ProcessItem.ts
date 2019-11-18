import { GuidValue, LanguageTag, MultilingualString } from '@omnia/fx-models';

export enum ProcessItemTypes {
    Undefined = 0,
    Internal = 1,
    External = 2,
    CustomLink = 3
}

export interface ProcessItem {
    type: ProcessItemTypes;
    title: MultilingualString;
}