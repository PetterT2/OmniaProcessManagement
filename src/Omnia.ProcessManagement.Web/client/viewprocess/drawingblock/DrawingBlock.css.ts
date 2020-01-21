import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { DrawingBlockStyles } from '../../models';
import { important } from 'csx';
import { SpacingSetting } from '@omnia/fx-models';

StyleFlow.define(DrawingBlockStyles,
    {
        blockPadding: (spacing: SpacingSetting) => {
            let paddingLeft = spacing && (spacing.left || 0)
            let paddingRight = spacing && (spacing.right || 0)
            let paddingTop = spacing && (spacing.top || 0)
            let paddingBottom = spacing && (spacing.bottom || 0)

            return {
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }
        },
        canvasWrapper: (theme: OmniaTheming) => {
            return {
                position: "relative" as any,
                padding: '0px',
                overflow: 'hidden',
                maxWidth: '100%'
            }
        },
        canvasOverflowWrapper: {
            overflow: 'auto',
            width: '100%'
        }
    }
)