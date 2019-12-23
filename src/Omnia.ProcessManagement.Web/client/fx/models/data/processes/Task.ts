import { MultilingualString, GuidValue } from '@omnia/fx-models';

export interface Task {
    id: GuidValue;
    title: MultilingualString;

    //client-side
    multilingualTitle?: string
}