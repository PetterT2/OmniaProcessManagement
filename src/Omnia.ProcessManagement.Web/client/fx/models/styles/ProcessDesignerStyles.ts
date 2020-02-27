import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export module ProcessDesignerStyles {
    export const PanelStyles = {} as {
        settingsPanel: (backgroundColor) => types.NestedCSSProperties;
    };
    export const BlockWithToolbarStyles = {} as {
        blockWrapper?: (theme: OmniaTheming, width?: number) => types.NestedCSSProperties;
        blockOverflowWrapper?: types.NestedCSSProperties;
        toolbarWrapper?: (theme: OmniaTheming) => types.NestedCSSProperties;
    };
}