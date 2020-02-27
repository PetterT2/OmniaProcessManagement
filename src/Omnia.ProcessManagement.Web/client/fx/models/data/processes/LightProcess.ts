import { GuidValue, MultilingualString } from '@omnia/fx-models';

export interface LightProcess {
    id: GuidValue;
    title: MultilingualString;
    opmProcessIdNumber: number;

    // client-side
    multilingualTitle?: string;
}