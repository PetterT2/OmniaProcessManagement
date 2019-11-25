import { TokenBasedRouteStateData } from '@omnia/fx-models';
import { ProcessVersionType } from '../data';

export interface OPMRouteStateData extends TokenBasedRouteStateData {
    versionType: ProcessVersionType;
}