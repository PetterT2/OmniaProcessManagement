import { types } from 'typestyle';

export const SearchTemplateProcessStyles = {} as
    {
        container?: types.NestedCSSProperties;
        image?: (imageUrl?: string) => types.NestedCSSProperties;
        contentWapper?: types.NestedCSSProperties;
        content?: types.NestedCSSProperties;
        longContent?: types.NestedCSSProperties;
        trimTextBox?: types.NestedCSSProperties;
        title?: (textColor: string) => types.NestedCSSProperties;
        previewBlock?: types.NestedCSSProperties;
        collapsePreviewButtonContainer?: types.NestedCSSProperties;
        collapsePreviewButton?: types.NestedCSSProperties;
        expandButton?: types.NestedCSSProperties;
        previewIframe?: (width: string) => types.NestedCSSProperties;
        previewWapper?: (width: string) => types.NestedCSSProperties;
    };