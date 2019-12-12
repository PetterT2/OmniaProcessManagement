import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';

export const ProcessStepPickerStyles = {} as {
    leftIcon?: types.NestedCSSProperties;
    leftIconExpanded?: types.NestedCSSProperties;
    contentHide?: types.NestedCSSProperties;
    wrapper?: types.NestedCSSProperties;
    headerWrapper?: (level: number, isSelected: boolean, theme: OmniaTheming, disabled: boolean) => types.NestedCSSProperties;

    title?: (selected: boolean) => types.NestedCSSProperties;
    content?: types.NestedCSSProperties;
}