import { style, cssRule, cssRaw, types } from "typestyle";
import { important } from 'csx';
import colors from 'vuetify/es5/util/colors';
import { OmniaTheming } from "@omnia/fx/ux"
import { StyleFlow } from '@omnia/fx/ux';
import { NavigationNodeStyles, IColor } from '../../../fx/models';

StyleFlow.define(NavigationNodeStyles, {
    wrapper: {
        width: "100%"
    },
    headerWrapperCommonStyles: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "50px",
        paddingLeft: '10px',
        position: "relative" as any,
        $nest: {
            '&:hover': {
                cursor: "pointer",
                color: important('white'),
                $nest:
                {
                    'i': { color: important('white') }
                }
            }
        }
    },
    headerWrapperDynamicStyles: (isRoutePath: boolean, level: number, theme: OmniaTheming) => {
        let bgColorStr = isRoutePath ? theme.promoted.body.onComponent.darken2 : "";
        let textColor = isRoutePath ? "#fff" : "";

        let hoverColorStr = theme.promoted.body.primary.lighten1;
        let padding = level * 10;
        return {
            paddingLeft: important(padding + 'px'),
            backgroundColor: bgColorStr,
            color: textColor,
            $nest: {
                '&:hover': {
                    background: hoverColorStr
                }
            }
        }
    },
    leftIcon: {
        flex: "0 0 auto",
        paddingLeft: "7px",
        minWidth: "35px",
        transformOrigin: "center center",
        transition: "transform .3s ease-in-out"
    },
    leftIconExpanded: {
        transform: "rotate(-180deg)"
    },
    title: (selected: boolean) => {
        return {
            paddingLeft: "4px",
            flex: "1 1 100px",
            overflow: "hidden",
            whiteSpace: "nowrap" as any,
            textOverflow: "ellipsis"
        }
    },
    actionBar: {
        flex: "0 0 auto",
        display: "flex"
    },
    content: {
        transition: "max-height 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)",
        overflow: "hidden"
    },
    contentHide: {
        maxHeight: "0px",
        display: "none"
    }
});




