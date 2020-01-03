import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { DrawingBlockStyles } from '../../models';
import { important } from 'csx';

StyleFlow.define(DrawingBlockStyles,
    {
        canvasWrapper: (theme: OmniaTheming) => {
            return {
                position: "relative" as any,
                padding: '0px',
                overflow: 'hidden',
                maxWidth: '100%',
                boxShadow: important("inset 0px 2px 0px 0px " + theme.promoted.body.primary.base + "," + "inset 0px -2px 0px 0px " + theme.promoted.body.primary.base)
            }
        },
        canvasOverflowWrapper: {
            overflow: 'auto',
            width: '100%'
        }
    }
)