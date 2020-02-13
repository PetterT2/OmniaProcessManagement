import { types } from 'typestyle';

export const ShapeGalleryDefaultSettingStyles = {} as {
    previewWrapper?: (canvasSize: number) => types.NestedCSSProperties;
    webkitScrollbar?: (canvasSize: number) => types.NestedCSSProperties;
    canvasPreviewWrapper?: (canvasSize: number) => types.NestedCSSProperties;
}