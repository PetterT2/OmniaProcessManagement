import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';
import { IColor } from './IColor';

export const NavigationNodeStyles = {} as {
    wrapper?: types.NestedCSSProperties;
    extendedButtons?: (theme: OmniaTheming) => types.NestedCSSProperties;
    headerWrapper?: (level: number, isRoutePath, theme: OmniaTheming, readOnly: boolean) => types.NestedCSSProperties;
    leftIcon?: types.NestedCSSProperties;
    leftIconExpanded?: types.NestedCSSProperties;
    leftIconWithoutButton?: types.NestedCSSProperties;
    title?: (selected:boolean) => types.NestedCSSProperties;
    actionBar?: types.NestedCSSProperties;
    actionBarExtended?: types.NestedCSSProperties;
    content?: types.NestedCSSProperties;
    contentHide?: types.NestedCSSProperties;
    contentShow?: (childNodes: number) => types.NestedCSSProperties;
    dialogHeaderWrap?: (background: IColor, text: IColor) => types.NestedCSSProperties;
};