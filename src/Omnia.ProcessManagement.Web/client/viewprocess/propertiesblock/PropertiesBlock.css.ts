import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { PropertiesBlockStyles } from '../../models';
import { SpacingSettings } from '@omnia/fx-models';

StyleFlow.define(PropertiesBlockStyles,
    {
        blockPadding: (spacing: SpacingSettings) => {
            let paddingLeft = spacing && (spacing.left || 0)
            let paddingRight = spacing && (spacing.right || 0)
            let paddingTop = spacing && (spacing.top || 0)
            let paddingBottom = spacing && (spacing.bottom || 0)

            return {
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }
        },
        wrapper: {
        },
        contentHidden: {
            display: 'none',
        },
        propertyLabel: {
            opacity: 0.7
        },
        propertyValue: {
            opacity: 0.9
        },
        propertyText: (theme: OmniaTheming) => {
            return {
                color: theme.promoted.body.text.base,
                lineHeight: "36px",
                fontSize: "20px"
            };
        },
    }
)