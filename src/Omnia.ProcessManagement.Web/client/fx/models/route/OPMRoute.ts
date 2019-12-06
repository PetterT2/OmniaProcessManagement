import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';

export enum RouteOptions {
    normal = "",
    viewLatestPublishedInGlobal = "view",
    previewDraft = "preview"
}

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue,
    routeOption: RouteOptions
}