import { StyleFlow } from "@omnia/fx/ux";
import { ShapeGalleryDefaultSettingStyles } from '../../../../../fx/models';

StyleFlow.define(ShapeGalleryDefaultSettingStyles, {
    previewWrapper: (canvasSize: number) => {
        return {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column' as any,
            margin: '0 auto',
            height: canvasSize + 30 + 'px',
            width: canvasSize + 'px'
        }
        
    },
    webkitScrollbar: (canvasSize: number) => {
        return {
            maxHeight: canvasSize + 'px',
            maxWidth: canvasSize + 'px',
            $nest: {
                '::-webkit-scrollbar': {
                    width: "5px",
                    height: "5px"
                },
                '::-webkit-scrollbar-thumb': {
                    borderRadius: "10px",
                    backgroundColor: "#c2c2c2",
                    boxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
                    $nest: {
                        '&:hover': {
                            backgroundColor: "#919191",
                        }
                    }
                },
                '::-webkit-scrollbar-track': {
                    borderRadius: "10px",
                    backgroundColor: "#e0e0e0",
                    boxShadow: "inset 0 0 6px rgba(0,0,0,.3)"
                }
            }
        }
        
    },
    canvasPreviewWrapper: (canvasSize: number) => {
        return {
            display: 'flex',
            maxHeight: canvasSize + 'px',
            maxWidth: canvasSize + 'px',
            overflow: 'auto'
        }
    }
});