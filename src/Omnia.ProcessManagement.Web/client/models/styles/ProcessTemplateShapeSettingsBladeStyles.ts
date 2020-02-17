import { NestedCSSProperties } from 'typestyle/lib/types';

/**
 * The styles in this interface must be common and can be used in any tabs
 * If there is any style specific for a tab only, define its own css.ts
 * */
export interface ProcessTemplateShapeSettingsBladeStylesInterface<T extends NestedCSSProperties | string> {
    flexDisplay: T;
    contentPadding: T;
    shapePreviewContainer: T;
    canvas: T;
    hidePreviewContainer: T;
    shapeSettingsContainer: T;
}

export const ProcessTemplateShapeSettingsBladeStyles = {} as ProcessTemplateShapeSettingsBladeStylesInterface<NestedCSSProperties>