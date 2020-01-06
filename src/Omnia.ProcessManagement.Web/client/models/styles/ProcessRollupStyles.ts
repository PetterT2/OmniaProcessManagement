import { types } from 'typestyle';
import { OmniaTheming } from '@omnia/fx/ux';
import { SpacingSetting } from '@omnia/fx-models';

export const ProcessRollupStyles = {} as
    {
        transparent?: types.NestedCSSProperties;
        container?: types.NestedCSSProperties;
        filterRefinerWrapper?: types.NestedCSSProperties;
        queryFailMsgWrapper?: types.NestedCSSProperties;
        getPaddingStyle?: (spacing: SpacingSetting, skip?: { top?: boolean, right?: boolean, left?: boolean, bottom?: boolean }) => types.NestedCSSProperties;
    }

export const ProcessRollupBlockSettingsStyles = {} as {
    alignSelfCenter: types.NestedCSSProperties;
    filterSettings: types.NestedCSSProperties;
    filterActionWrapper: types.NestedCSSProperties;
    floatRight: types.NestedCSSProperties;
    filterItemWrapper: types.NestedCSSProperties;
    checkboxFilter: types.NestedCSSProperties;
    taxonomyFilterMargin: types.NestedCSSProperties;
    pointer: types.NestedCSSProperties;
    limitWidthInputWrapper: types.NestedCSSProperties;
    resourceHeaderWrapper: types.NestedCSSProperties;
    expansionHeaderWrapper: types.NestedCSSProperties;
    hiddenCheckBox: types.NestedCSSProperties;
};

export const ProcessRollupBlockListViewStyles = {} as
    {
    tableWrapper?: types.NestedCSSProperties;
    titleLayout?: types.NestedCSSProperties;
    logoIcon?: types.NestedCSSProperties;
    socialIcon?: types.NestedCSSProperties;
    customOmfxPeoplePicker?: types.NestedCSSProperties;
    titleLink?: types.NestedCSSProperties;
    clickableLink?: types.NestedCSSProperties;
    getPaddingStyle?: (spacing: SpacingSetting, skip?: { top?: boolean, right?: boolean, left?: boolean, bottom?: boolean }) => types.NestedCSSProperties;
    }

export const ProcessRollupBlockListViewSettingsStyles = {} as
    {
    columnWrapper?: types.NestedCSSProperties;
    orderAction?: types.NestedCSSProperties;
    widthInput?: types.NestedCSSProperties;
    showHeadingCheckbox?: types.NestedCSSProperties;
    }