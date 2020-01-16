import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const ShapeSelectionStyles = {} as {
    shapesWrapper?: types.NestedCSSProperties;
    shapeDefinitionItem?: (size: number) => types.NestedCSSProperties;
    canvasWrapper?: (theme: OmniaTheming, size: number) => types.NestedCSSProperties;
    iconWrapper?: types.NestedCSSProperties;
    wrapper: types.NestedCSSProperties;
    dialogFooter: types.NestedCSSProperties;
    centerDialogBody: types.NestedCSSProperties;
};