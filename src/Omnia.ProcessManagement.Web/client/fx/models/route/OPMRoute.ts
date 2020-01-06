import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';

export enum RouteOptions {
    publishedInBlockRenderer = "",
    publishedInGlobalRenderer = "/g",

    previewInBlockRenderer = "/preview",
    previewInGlobalRenderer = "/preview/g"
}

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue,
    routeOption: RouteOptions
}