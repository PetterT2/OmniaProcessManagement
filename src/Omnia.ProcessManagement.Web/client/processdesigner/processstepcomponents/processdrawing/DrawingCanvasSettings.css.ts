import { StyleFlow } from "@omnia/fx/ux";
import { DrawingCanvasSettingsStyles } from '../../../fx/models';
import { important } from 'csx';

StyleFlow.define(DrawingCanvasSettingsStyles, {
    image: {
        maxWidth: '200px'
    }
});