import { StyleFlow } from "@omnia/fx/ux";
import { DrawingCanvasSettingsStyles } from '../../../fx/models/styles';
import { important } from 'csx';

StyleFlow.define(DrawingCanvasSettingsStyles, {
    mediaPickerDialog: {
        height: '100%',
        maxHeight: important('90%'),
        width: important('90%'),
        margin: important('20px'),
        $nest: {
            '.omfx-dialog-content': {
                height: '100%',
                $nest: {
                    '.omfx-image-picker-form': {
                        height: '100%'
                    }
                }
            }
        }
    }
});