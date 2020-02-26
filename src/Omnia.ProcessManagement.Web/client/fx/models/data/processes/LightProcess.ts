import { GuidValue, MultilingualString } from '@omnia/fx-models';

export interface LightProcess {
    id: GuidValue;
    title: MultilingualString;

    // client-side
    multilingualTitle?: string;
}