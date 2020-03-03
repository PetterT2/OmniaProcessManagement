import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { ProcessDesignerStyles } from "../../../fx/models";
import { important } from 'csx';

StyleFlow.define(ProcessDesignerStyles.BlockWithToolbarStyles, {
    blockWrapper: (theme: OmniaTheming, width?: number, minHeight?: number) => {
        let blockWidth = width ? width + 'px' : 'auto';
        let blockMinHeight = minHeight ? minHeight + 'px' : undefined;
        return {
            position: "relative" as any,
            padding: '0px',
            overflow: 'hidden',
            maxWidth: '100%',
            width: blockWidth,
            minHeight: blockMinHeight,
            boxShadow: important("inset 0px 2px 0px 0px " + theme.promoted.body.primary.base + "," + "inset 0px -2px 0px 0px " + theme.promoted.body.primary.base)
        }
    },
    blockOverflowWrapper: {
        overflow: 'auto',
        width: '100%'
    },
    toolbarWrapper: (theme: OmniaTheming) => {
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

