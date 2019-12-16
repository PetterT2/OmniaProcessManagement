import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const ShapeSelectionStepStyles = {} as {
    shapesWrapper?: types.NestedCSSProperties;
    shapeDefinitionItem?: (size: number) => types.NestedCSSProperties;
    canvasWrapper?: (theme: OmniaTheming, size: number) => types.NestedCSSProperties;
    iconWrapper?: types.NestedCSSProperties;
};