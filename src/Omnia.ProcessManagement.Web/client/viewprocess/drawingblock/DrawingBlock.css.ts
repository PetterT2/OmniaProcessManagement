import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { DrawingBlockStyles } from '../../models';
import { important } from 'csx';
import { SpacingSettings } from '@omnia/fx-models';

StyleFlow.define(DrawingBlockStyles,
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
        },
        slide: {
            transition: 'margin 500ms'
        },
        slideButtonWrapper: {
            width: '100%',
            position: 'absolute',
        },
        slideButton: {
            position: 'absolute',
            background: 'transparent!important',
            zIndex: 1,
            $nest: {
                '&:hover': {
                    position: 'absolute',
                    background: '#fff!important'
                }
            }
        },
        slideLeftButton: {
            left: '0'
        },
        slideRightButton: {
            right: '0'
        }
    }
)