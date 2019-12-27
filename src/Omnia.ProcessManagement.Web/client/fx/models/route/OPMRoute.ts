import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';

export enum RouteOptions {
    latestPublishedInBlockRenderer = "",
    latestPublishedInGlobalRenderer = "g/",

    draftInBlockRenderer = "preview/",
    draftInGlobalRenderer = "preview/g/"
}

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue,
    routeOption: RouteOptions
}