import { types } from 'typestyle';
import { Theming, SpacingSetting } from '@omnia/fx-models';

export const ProcessNavigationBlockStyles = {} as {
    blockPadding?: types.NestedCSSProperties;
    levelIndentationIconWrapper?: types.NestedCSSProperties;
    wrapper: types.NestedCSSProperties;
    headerWrapper: (level: number, indentation: number, isRoutePath: boolean, theming: Theming, padding: SpacingSetting) => types.NestedCSSProperties;
    rightIcon: types.NestedCSSProperties;
    arrowBtnCollapsedDefault: types.NestedCSSProperties;
    arrowBtnExpanded: types.NestedCSSProperties;
    title: types.NestedCSSProperties;
    textOverflow: types.NestedCSSProperties;
    content: types.NestedCSSProperties;
    contentHide: types.NestedCSSProperties;
    clickProtectionOverlay: types.NestedCSSProperties;
}