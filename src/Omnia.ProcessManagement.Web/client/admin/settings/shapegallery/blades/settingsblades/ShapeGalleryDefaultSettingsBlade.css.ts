import { StyleFlow } from "@omnia/fx/ux";
import { ShapeGalleryDefaultSettingStyles } from '../../../../../fx/models';

StyleFlow.define(ShapeGalleryDefaultSettingStyles, {
    previewWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        margin: '0 auto',
        maxHeight: '200px',
        height: '100%',
        width: '200px',
    },
    webkitScrollbar: {
        maxHeight: '200px',
        maxWidth: '200px',
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
    },
    canvasPreviewWrapper: {
        display: 'flex',
        maxHeight: '200px',
        maxWidth: '200px',
        overflow: 'auto'
    }
});