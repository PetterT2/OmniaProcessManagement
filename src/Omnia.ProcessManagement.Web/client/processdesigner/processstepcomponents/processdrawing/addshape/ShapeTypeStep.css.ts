import { StyleFlow } from "@omnia/fx/ux";
import { ShapeTypeStepStyles } from '../../../../fx/models/styles';

StyleFlow.define(ShapeTypeStepStyles, {
    canvasPreviewWrapper: {
        maxWidth: '100%',
        maxHeight: '300px',
        overflow: 'auto'        
    }    
});