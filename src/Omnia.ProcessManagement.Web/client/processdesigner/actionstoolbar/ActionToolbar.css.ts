import { style } from "typestyle";
import { important } from 'csx';
import { IColor } from '../../models/styles';
import { ProcessDesignerStyleSettings } from '../ProcessDesigner.css';

/**
 * Styles for the Device Previewer
 */

export const ActionToolbarStyles = {

    loadingIndicator: {
        wrapper: style({
            width: "100%",
        }),
        positioning: style({
            marginTop: "10px",
            float: "right",
            marginRight: "40px"
        })
    },
    positioning: (background: IColor) => {
        return style({
            position: "fixed",
            bottom: "0px",
            width: "100%",
            height: "50px",
            background: background.base,
            boxShadow: "0 3px 14px 2px rgba(0, 0, 0, .12)",
            display: "flex",
            justifyContent: "center",
            transition: "padding 0.3s",
            zIndex: ProcessDesignerStyleSettings.layerIndex.actionToolbar
        });
    },
    actionButtons: style({
        marginRight: "20px",
        display: "flex",
        alignItems: "center"
    }),
    statusButton: style({
        display: "flex",
        alignItems: "center",
        $nest: {
            '.v-ripple__container': {
                display: "none !important"
            }
        }
    }),
    actionButtonsLeft: style({
        marginLeft: "20px",
        display: "flex",
        alignItems: "center"
    }),
    viewButton: style({
        margin: "0!important",
        padding: "8px 32px 10px 32px!important",
        height: "64px!important",
        opacity: 0.22,
        $nest: {
            '.v-btn__content': {
                flexDirection: "column-reverse!important" as any,
                fontSize: "14px",
                fontWeight: 400,
                textTransform: "none",
                marginTop: "0px!important",
            },
            '&:hover': {
                opacity: 1
            }
        }
    }),
    activeViewButton: style({
        opacity: 1
    }),

    extendedButtonText: (dark: boolean) => {
        let textColor = "#000";
        if (dark) {
            textColor = "#FFF"
        }
        //if (EditorStyleSettings.theme.chrome.dark) {
        //    textColor = "#FFF"
        //}
        return style({
            color: textColor,
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "uppercase",
        });
    },

    extendedButtons: (background: IColor) => {
        return style({
            background: important(background.base)
            //background: important(EditorStyleSettings.theme.chrome.background.base)
        })
    },

    displayToolbar: {
        positioningBar: (background: IColor) => {
            let backgroundColor = background.base;
            //if (EditorStyleSettings.darkMode) {
            //    backgroundColor = EditorStyleSettings.theme.chrome.grey.darken4;
            //}
            return style({
                position: "relative",
                height: "60px",
                top: "-60px",
                boxShadow: "0 3px 14px 2px rgba(0, 0, 0, .12)",
                backgroundColor: backgroundColor,
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                opacity: 0.8,
            });
        }
    },
    buttonGroupWapper: style({
        margin: important("6px 8px"),
        display: important("inline-block"),
        $nest: {
            "button": {
                $nest: {
                    "&:first-child": {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0
                    },
                    "&:last-child": {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0
                    }
                }
            }
        }
    })
}