import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';
import { IColor } from './IColor';

export const NavigationNodeStyles = {} as {
    wrapper?: types.NestedCSSProperties;
    headerWrapperCommonStyles?: types.NestedCSSProperties;
    headerWrapperDynamicStyles?: (isRoutePath: boolean, theme: OmniaTheming) => types.NestedCSSProperties;
    leftIcon?: types.NestedCSSProperties;
    leftIconExpanded?: types.NestedCSSProperties;
    title?: (selected:boolean) => types.NestedCSSProperties;
    actionBar?: types.NestedCSSProperties;
    content?: types.NestedCSSProperties;
    contentHide?: types.NestedCSSProperties;
};