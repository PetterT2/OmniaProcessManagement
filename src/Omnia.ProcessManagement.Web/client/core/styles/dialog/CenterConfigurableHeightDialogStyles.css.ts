import { StyleFlow } from "@omnia/fx/ux";
import { CenterConfigurableHeightDialogStyles } from '../../../fx/models';
import { important } from 'csx';

let dialogDefaultPadding: number = 30;
let dialogTitleHeight: number = 64;
let dialogActionsHeight: number = 52;
StyleFlow.define(CenterConfigurableHeightDialogStyles, {
    dialogContentClass:
    {
        height: '100%',
        maxHeight: important('100%'),
        width: '100%',
        margin: important('0px'),
        padding: dialogDefaultPadding + 'px',
        overflow: important('hidden'),
        boxShadow: important('none'),
        $nest:
        {
            '.omfx-dialog-content': { height: '100%' }
        }
    },
    dialogHeightPercentage: (heightPercentage: string) => {
        return {
            height: important(heightPercentage),
            maxHeight: important(heightPercentage),
            paddingTop: important(0),
            paddingBottom: important(0)
        }
    },
    bodyWrapper: {
        position: important("absolute"),
        width: "100%",
        top: `${dialogTitleHeight}px`,
        height: `calc(100% - ${dialogTitleHeight}px)`
    },
    contentWrapper: {
        height: `calc(100% - ${dialogActionsHeight}px)`,
        overflowY: "auto"
    }
});