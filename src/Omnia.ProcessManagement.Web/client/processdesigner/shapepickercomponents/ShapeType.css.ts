import { StyleFlow } from "@omnia/fx/ux";
import { ShapeTypeStyles } from '../../fx/models/styles';

StyleFlow.define(ShapeTypeStyles, {
    previewWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        margin: '0 auto',
        maxHeight: '500px',
        height: '100%',
        width: '300px',

    },
    webkitScrollbar: {
        maxHeight: '500px',
        maxWidth: '300px',
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
        //justifyContent: 'center',
        //alignItems: 'center',
        maxHeight: '500px',
        maxWidth: '300px',
        overflow: 'auto'
    },
    textMarginLabel: {
        fontSize: '12px'
    },
    error: {
        color: "#a94442"
    }
});