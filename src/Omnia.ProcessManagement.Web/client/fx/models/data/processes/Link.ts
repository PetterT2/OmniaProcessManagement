import { MultilingualString, GuidValue } from '@omnia/fx-models';

export interface Link {
    id: GuidValue;
    title: MultilingualString;
    url: string;
    openNewWindow: boolean;
}