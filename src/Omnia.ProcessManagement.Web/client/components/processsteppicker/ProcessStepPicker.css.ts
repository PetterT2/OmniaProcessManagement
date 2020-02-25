import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { ProcessStepPickerStyles } from '../../fx/models';
import { important } from 'csx';


StyleFlow.define(ProcessStepPickerStyles,
    {
        leftIconExpanded: {
            transform: "rotate(-180deg)"
        },
        contentHide: {
            maxHeight: "0px",
            display: "none"
        },
        wrapper: {
            width: "100%"
        },
        headerWrapper: (level: number, isRoutePath: boolean, theme: OmniaTheming, disabled: boolean) => {
            let padding = level * 10;
            let bgColorStr = isRoutePath ? theme.promoted.body.onComponent.darken2 : "";//EditorStyleSettings.theme.chrome.primary.darken2
            let textColor = isRoutePath ? "#fff" : "";
            let hoverColorStr = theme.promoted.body.primary.lighten1;
            return {
                width: "100%",
                backgroundColor: bgColorStr,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "50px",
                paddingLeft: padding,
                color: textColor,
                position: "relative" as any,
                cursor: disabled ? "not-allowed" : "pointer",
                $nest: disabled ? {} : {
                    '&:hover': {
                        background: hoverColorStr,
                        color: important('white'),
                        $nest:
                        {
                            'i': { color: important('white') }
                        }
                    }
                }
            }
        },
        leftIcon: {
            flex: "1 0 0px",
            paddingLeft: "7px",
            minWidth: "35px",
            transformOrigin: "center center",
            transition: "transform .3s ease-in-out"
        },
        title: (selected: boolean) => {
            let paddingRight = selected ? "90px" : "25px"
            return {
                paddingLeft: "4px",
                flex: "10 0 100px",
                overflow: "hidden",
                whiteSpace: "nowrap" as any,
                textOverflow: "ellipsis",
                paddingRight: paddingRight
            }
        },
        content: {
            transition: "max-height 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)",
            overflow: "hidden"
        }
    }
)