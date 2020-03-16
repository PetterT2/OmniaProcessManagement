import { StyleFlow } from "@omnia/fx/ux";
import { CenterConfigurableHeightDialogStyles } from '../../fx/models';
import { important } from 'csx';

StyleFlow.define(CenterConfigurableHeightDialogStyles, {
    dialogContentClass:
    {
        height: '100%',
        maxHeight: important('100%'),
        width: important('100%'),
        margin: important('0px'),
        padding: '30px',
        overflow: important('hidden'),
        boxShadow: important('none'),
        $nest:
        {
            '.omfx-dialog-content': { height: '100%' }
        }
    },
    bodyWrapper: {
        position: important("absolute"),
        width: "100%",
        top: "60px",
        height: "calc(100% - 64px)"
    },
    contentWrapper: {
        height: "calc(100% - 52px)",
        overflowY: "auto"
    }
});