import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const ProcessStepDrawingStyles = {} as {
    settingsPanel?: (backgroundColor: string) => types.NestedCSSProperties;
    canvasWrapper?: (theme: OmniaTheming) => types.NestedCSSProperties;
    canvasToolbar?: (theme: OmniaTheming) => types.NestedCSSProperties;
    canvasOverflowWrapper?: types.NestedCSSProperties;
};