
import { Localize } from '@omnia/fx';
import { DisplayBreakPoint } from '../../models/processdesigner';

export class DisplayBreakPointFactory {

    private static breakPointArray: Array<DisplayBreakPoint> = null;
    //@Localize(WCMCoreLocalization.namespace) static loc: WCMCoreLocalization.locInterface//todo



    static breakPoints(): Array<DisplayBreakPoint> {
        if (DisplayBreakPointFactory.breakPointArray) {
            return DisplayBreakPointFactory.breakPointArray
        }
        DisplayBreakPointFactory.breakPointArray = [];
        DisplayBreakPointFactory.breakPointArray.push(
            {
                id: "xs",
                icon: "smartphone",
                label: "Extra small",//DisplayBreakPointFactory.loc.DisplayBreakPoints.ExtraSmall,//todo
                rangedescription: "<600px",
                minWidth: 0,
                maxWidth: 599,
                previewWidth: "400px",
                enableDisplayBreakPointSettings: true
            }
        );
        DisplayBreakPointFactory.breakPointArray.push(
            {
                id: "sm",
                icon: "tablet_mac",
                label:"Small",// DisplayBreakPointFactory.loc.DisplayBreakPoints.Small,
                rangedescription: "600px - 960px",
                minWidth: 600,
                maxWidth: 960,
                previewWidth: "800px",
                enableDisplayBreakPointSettings: true
            }
        );
        DisplayBreakPointFactory.breakPointArray.push(
            {
                id: "md",
                icon: "laptop_mac",
                label: "Medium",//DisplayBreakPointFactory.loc.DisplayBreakPoints.Medium,
                rangedescription: "961px - 1264px",
                minWidth: 961,
                maxWidth: 1264,
                previewWidth: "1260px",
                enableDisplayBreakPointSettings: true
            }
        );
        DisplayBreakPointFactory.breakPointArray.push(
            {
                id: "lg",
                icon: "desktop_mac",
                label:"Large",// DisplayBreakPointFactory.loc.DisplayBreakPoints.Large,
                //rangedescription: "1265px - 1904px",
                rangedescription: ">1264px",
                minWidth: 1265,
                maxWidth: 10000,
                previewWidth: "100%",
                enableDisplayBreakPointSettings: false
            }
        );
        return DisplayBreakPointFactory.breakPointArray
    }
}

