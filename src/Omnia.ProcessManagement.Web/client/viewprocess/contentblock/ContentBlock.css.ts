import { StyleFlow } from "@omnia/fx/ux";
import { ContentBlockStyles } from '../../models';
import { SpacingSettings } from '@omnia/fx-models';

StyleFlow.define(ContentBlockStyles,
    {
        blockPadding: (spacing: SpacingSettings) => {
            let paddingLeft = spacing && (spacing.left || 0)
            let paddingRight = spacing && (spacing.right || 0)
            let paddingTop = spacing && (spacing.top || 0)
            let paddingBottom = spacing && (spacing.bottom || 0)

            return {
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }
        }
    }
)