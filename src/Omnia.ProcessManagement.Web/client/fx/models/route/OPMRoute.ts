import { TokenBasedRoute, GuidValue } from '@omnia/fx-models';

export enum ViewOptions {
    viewLatestPublishedInBlock = "",
    viewLatestPublishedInGlobal = "view",
    previewDraft = "preview"
}

export interface OPMRoute extends TokenBasedRoute {
    processStepId: GuidValue,
    viewOption: ViewOptions
}