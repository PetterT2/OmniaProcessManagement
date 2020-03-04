import { GuidValue, MultilingualString } from '@omnia/fx-models';

export interface LightProcess {
    opmProcessId: GuidValue;
    title: MultilingualString;
    opmProcessIdNumber: number;

    // client-side
    multilingualTitle?: string;
}