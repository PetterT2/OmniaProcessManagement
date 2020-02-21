import { types } from 'typestyle';
import { SpacingSetting } from '@omnia/fx-models';

export const BreadcrumbBlockStyles = {} as {
    padding?: (spacing: SpacingSetting) => types.NestedCSSProperties;
    layout?: types.NestedCSSProperties;
    breadcrumbLink?: types.NestedCSSProperties;
};