import { types } from 'typestyle';

export const CenterConfigurableHeightDialogStyles = {} as {
    dialogContentClass?: types.NestedCSSProperties;
    dialogHeightPercentage?: (heightPercentage: string) => types.NestedCSSProperties;
    bodyWrapper?: types.NestedCSSProperties;
    contentWrapper?: types.NestedCSSProperties;
    loadingWrapper?: types.NestedCSSProperties;
};

export const CenterScrollableDialogStyles = {} as {
    dialogContentClass?: types.NestedCSSProperties;
    dialogInnerWrapper?: types.NestedCSSProperties;
    dialogTitle?: types.NestedCSSProperties;
    dialogMainContent?: types.NestedCSSProperties;
    dialogActions?: types.NestedCSSProperties;
    loadingWrapper?: types.NestedCSSProperties;
};

export const VDialogScrollableDialogStyles = {} as {
    dialogTitle?: types.NestedCSSProperties;
    dialogMainContent?: types.NestedCSSProperties;
};