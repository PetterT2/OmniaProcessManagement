import { StyleFlow } from "@omnia/fx/ux";
import { ShapeTypeStyles } from '../../fx/models/styles';

StyleFlow.define(ShapeTypeStyles, {
    canvasPreviewWrapper: {
        maxWidth: '100%',
        maxHeight: '300px',
        overflow: 'auto'        
    }    
});