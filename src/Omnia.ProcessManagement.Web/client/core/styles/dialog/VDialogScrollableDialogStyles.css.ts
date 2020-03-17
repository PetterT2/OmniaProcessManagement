import { StyleFlow } from "@omnia/fx/ux";
import { VDialogScrollableDialogStyles } from '../../../fx/models';
import { important } from 'csx';

let mainContentPaddingLeftRight = '27px';
StyleFlow.define(VDialogScrollableDialogStyles, {
    dialogTitle: {
        paddingLeft: important(mainContentPaddingLeftRight),
        paddingRight: important('8px')
    },
    dialogMainContent: {
        padding: important(`15px ${mainContentPaddingLeftRight}`)
    }
});