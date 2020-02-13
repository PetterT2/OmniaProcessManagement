import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';
import { Version } from '../shared';

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue,
    globalRenderer: boolean,

    /***
     * -NULL    : Preview Version (defined in OPMSpecialRouteVersion)
     * -0-0     : Latest Published Version (defined in OPMSpecialRouteVersion)
     * -Others  : Specific Version
     * */
    version?: Version  
}