import { Enums, TitleBlockStyles } from '../../fx/models';
import { StyleFlow } from '@omnia/fx/ux';
const FontSizes = {
    [Enums.ProcessViewEnums.HeadingFormatting.Normal]: 13,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading1]: 30,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading2]: 23,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading3]: 18
}

const LineHeights = {
    [Enums.ProcessViewEnums.HeadingFormatting.Normal]: 1.6,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading1]: 1.42,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading2]: 1.42,
    [Enums.ProcessViewEnums.HeadingFormatting.Heading3]: 1.42
}

const FormattingStyles = {
    [Enums.ProcessViewEnums.HeadingFormatting.Heading1]: {
        fontSize: `${FontSizes[Enums.ProcessViewEnums.HeadingFormatting.Heading1]}px`,
        lineHeight: LineHeights[Enums.ProcessViewEnums.HeadingFormatting.Heading1]
    },
    [Enums.ProcessViewEnums.HeadingFormatting.Heading2]: {
        fontSize: `${FontSizes[Enums.ProcessViewEnums.HeadingFormatting.Heading2]}px`,
        lineHeight: LineHeights[Enums.ProcessViewEnums.HeadingFormatting.Heading2]
    },
    [Enums.ProcessViewEnums.HeadingFormatting.Heading3]: {
        fontSize: `${FontSizes[Enums.ProcessViewEnums.HeadingFormatting.Heading3]}px`,
        lineHeight: LineHeights[Enums.ProcessViewEnums.HeadingFormatting.Heading3]
    },
    [Enums.ProcessViewEnums.HeadingFormatting.Normal]: {
        fontSize: `${FontSizes[Enums.ProcessViewEnums.HeadingFormatting.Normal]}px`,
        lineHeight: LineHeights[Enums.ProcessViewEnums.HeadingFormatting.Normal]
    }
}

StyleFlow.define(TitleBlockStyles, {
    formattingLabels: (formatting: Enums.ProcessViewEnums.HeadingFormatting) => {
        return FormattingStyles[formatting];
    }
});