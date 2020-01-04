import { style, cssRule, cssRaw } from "typestyle";
import { important } from 'csx';

export const MediaPickerToolbarStyles = {
    pickerDialog: style({
        height: '100%',
        maxHeight: important('100%'),
        width: important('100%'),
        margin: important('0px'),
        padding: '30px',
        overflow: important('hidden'),
        $nest:
        {
            '.omfx-dialog-content': { height: '100%' }
        }
    }),
    pickerDialogContent:style({
        height: '100%',
    })
}