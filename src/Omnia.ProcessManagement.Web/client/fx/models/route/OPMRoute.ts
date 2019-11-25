import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue
}