import { TokenBasedRouteStateData, GuidValue } from '@omnia/fx-models';

export interface OPMRouteStateData extends TokenBasedRouteStateData {
    processId: GuidValue;
}