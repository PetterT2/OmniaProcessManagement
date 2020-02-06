import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const PropertiesBlockStyles = {} as {
    blockPadding?: types.NestedCSSProperties;
    layout?: types.NestedCSSProperties;
    wrapper?: types.NestedCSSProperties;
    contentHidden?: types.NestedCSSProperties;
    propertyLabel?: types.NestedCSSProperties;
    propertyValue?: types.NestedCSSProperties;
    propertyText?: (theme: OmniaTheming) => types.NestedCSSProperties;
}