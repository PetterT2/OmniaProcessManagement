import { StyleFlow } from '@omnia/fx/ux';
import { ProcessTemplateShapeSettingsBladeStyles } from '../../../../../models';
import { important } from 'csx';

StyleFlow.define(ProcessTemplateShapeSettingsBladeStyles,
    {
        flexDisplay: {
            display: "flex"
        },
        shapePreviewContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            margin: '0 auto',
            maxHeight: '500px',
            height: '100%',
            width: '580px',
        },
        webkitScrollbar: {
            maxHeight: '500px',
            maxWidth: '580px',
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
            maxHeight: '500px',
            maxWidth: '580px',
            overflow: 'auto'
        },
        hidePreviewContainer: {
            display: "none"
        },
        shapeSettingsContainer: {
            paddingTop: "5px"
        },
        error: {
            color: "#a94442"
        }
    });