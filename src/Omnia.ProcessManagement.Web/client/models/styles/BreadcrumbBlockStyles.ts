import { types } from 'typestyle';
import { SpacingSettings } from '@omnia/fx-models';

export const BreadcrumbBlockStyles = {} as {
    padding?: (spacing: SpacingSettings) => types.NestedCSSProperties;
    layout?: types.NestedCSSProperties;
    breadcrumbLink?: types.NestedCSSProperties;
};