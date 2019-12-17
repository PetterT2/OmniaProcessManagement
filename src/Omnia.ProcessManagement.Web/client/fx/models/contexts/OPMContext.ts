import { IMutableContext, GuidValue } from '@omnia/fx-models';

export interface IOPMContext extends IMutableContext<IOPMContext> {
    teamAppId: GuidValue;
}
