import { style } from "typestyle";
import { important } from 'csx';
import colors from 'vuetify/es5/util/colors';
import { DisplayBreakPoint } from '../../models/processdesigner';


/**
 * Styles for the Device Previewer
 */
export const DevicePreviewerStyles = {
    iFrame: style({
        width: "100%",
        height: "calc(100vh - 50px)",
        border: "0px",
    }),
    deviceToolbarWrapper: style({
        position: "fixed",
        top: 0,
        left: "calc(100%/2 - 107px)",
        boxShadow: "0 3px 14px 2px rgba(0, 0, 0, .12)",
    }),
    deviceToolbar: style({
        borderRadius: important("0px 0px 5px 5px"),
        opacity: 0.8
    }),
    fullScreen: style({
        width: "100%",
        backgroundColor: colors.grey.darken3
    }),
    deviceWrapper: (displayBreakPoint: DisplayBreakPoint, height:string) => {
        return style({
            width: displayBreakPoint.previewWidth,
            transition: "width 0.5s",
            height: height
        });
    },

}


