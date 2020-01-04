import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const DrawingBlockStyles = {} as {
    blockPadding?: types.NestedCSSProperties;
    canvasWrapper: (theme: OmniaTheming) => types.NestedCSSProperties;
    canvasOverflowWrapper: types.NestedCSSProperties;
}