//import { style, cssRule, cssRaw, types } from "typestyle";
//import { important } from 'csx';
//import colors from 'vuetify/es5/util/colors';
//import { OmniaTheming } from "@omnia/fx/ux"
//import { StyleFlow } from '@omnia/fx/ux';
//import { NavigationNodeStyles, IColor } from '../../../../../fx/models';

//export const NavigationDialog = {
//    wrapper: style({
//        overflow: "hidden"
//    })

//}


//StyleFlow.define(NavigationNodeStyles, {
//    wrapper: {
//        width: "100%"
//    },
//    extendedButtons: (theme: OmniaTheming) => {
//        return {
//            background: important(theme.chrome.secondary.base)
//        }
//    },
//    headerWrapper: (level: number, isRoutePath, theme: OmniaTheming) => {
//        let padding = level * 10;
//        let bgColorStr = isRoutePath ? theme.promoted.body.onComponent.darken2 : "";//EditorStyleSettings.theme.chrome.primary.darken2
//        let textColor = isRoutePath ? "#fff" : "";
//        let hoverColorStr = theme.promoted.body.primary.lighten1;
//        return {
//            width: "100%",
//            backgroundColor: bgColorStr,
//            display: "flex",
//            alignItems: "center",
//            justifyContent: "space-between",
//            height: "50px",
//            paddingLeft: padding,
//            color: textColor,
//            position: "relative" as any,
//            $nest: {
//                '&:hover': {
//                    background: hoverColorStr,
//                    cursor: "pointer",
//                    color: important('white'),
//                    $nest:
//                    {
//                        'i': { color: important('white') }
//                    }
//                }
//            }
//        }
//    },
//    leftIcon: {
//        flex: "1 0 0px",
//        paddingLeft: "7px",
//        minWidth: "35px",
//        transformOrigin: "center center",
//        transition: "transform .3s ease-in-out"
//    },
//    leftIconExpanded: {
//        transform: "rotate(-180deg)"
//    },
//    leftIconWithoutButton: {
//        flex: "1 0 0px",
//        //paddingLeft: "7px",
//        marginTop: "-7px",
//        minWidth: "27px"
//    },
//    title: (selected: boolean) => {
//        let paddingRight = selected ? "90px" : "25px"
//        return {
//            paddingLeft: "4px",
//            flex: "10 0 100px",
//            overflow: "hidden",
//            whiteSpace: "nowrap" as any,
//            textOverflow: "ellipsis",
//            paddingRight: paddingRight
//        }
//    },
//    actionBar: {
//        flex: "1 0 auto",
//        display: "flex",
//        position: "absolute",
//        right: "0",
//    },
//    actionBarExtended: {
//        display: "flex"
//    },
//    content: {
//        transition: "max-height 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)",
//        overflow: "hidden"
//    },
//    contentHide: {
//        maxHeight: "0px",
//        display: "none"
//    },
//    contentShow: (childNodes: number) => {
//        let maxHeight = childNodes * 50;
//        return {
//            maxHeight: maxHeight + "px"
//        }
//    },
//    dialogHeaderWrap: (background: IColor, text: IColor) => {
//        return {
//            background: background.base,
//            color: text.base
//        }
//    }
//});




