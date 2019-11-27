import { style, cssRule, cssRaw } from "typestyle";
import { OmniaTheming } from "@omnia/fx/ux"

/**
 * Styles for the Navigation Panel component
 */
export const TabsPanelStyles = {
    textColor: (theme: OmniaTheming, error: boolean) => {
        let color = theme.system.grey.darken4;
        if (error)
            color = "#FF5252"
        else if (theme.chrome.dark) {
            color = "#FFF"
        }
        return style({
            color: color + "!important",
        })
    }
}


