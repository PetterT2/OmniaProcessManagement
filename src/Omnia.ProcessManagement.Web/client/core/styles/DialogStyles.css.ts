import { StyleFlow } from "@omnia/fx/ux";
import { CenterFullHeightDialogStyles } from '../../fx/models';
import { important } from 'csx';

StyleFlow.define(CenterFullHeightDialogStyles, {
    dialogContainer:
    {
        height: "100%",
        maxHeight: important("100%"),
        width: important("100%"),
        margin: important("0px"),
        padding: "30px",
        overflow: important("hidden"),
        $nest:
        {
            ".omfx-dialog-content": { height: "100%" }
        }
    },
    dialogContent: {
        height: "100%"
    },
});