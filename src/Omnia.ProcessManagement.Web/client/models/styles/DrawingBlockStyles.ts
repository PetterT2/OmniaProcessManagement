import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const DrawingBlockStyles = {} as {
    blockPadding?: types.NestedCSSProperties;
    canvasWrapper: (theme: OmniaTheming) => types.NestedCSSProperties;
    canvasOverflowWrapper: types.NestedCSSProperties;
    slide: types.NestedCSSProperties;
    slideButtonWrapper: types.NestedCSSProperties;
    slideButton: types.NestedCSSProperties;
    slideLeftButton: types.NestedCSSProperties;
    slideRightButton: types.NestedCSSProperties;
}