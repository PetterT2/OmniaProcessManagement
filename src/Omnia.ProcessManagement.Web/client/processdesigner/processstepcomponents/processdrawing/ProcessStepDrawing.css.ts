import { important } from 'csx';
import { StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { ProcessStepDrawingStyles } from '../../../fx/models';

StyleFlow.define(ProcessStepDrawingStyles, {
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
    },
    canvasToolbar: (theme: OmniaTheming) => {
        return {
            position: "absolute" as any,
            borderRadius: "0px 4px 4px 4px",
            top: "0px",
            right: "0px",
            paddingTop: "1px",
            height: "30px",
            backgroundColor: theme.promoted.body.primary.base,
            zIndex: 1
        }
    }
});


