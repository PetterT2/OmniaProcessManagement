import { StyleFlow } from '@omnia/fx/ux';
import { MediaPickerStyles } from '../../fx/models';
import { important } from 'csx';

export const MediaPickerClasses = StyleFlow.define(MediaPickerStyles,
    {
        pickerDialog:
        {
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
        },
        pickerDialogContent:
        {
            height: '100%',
        }
    });

