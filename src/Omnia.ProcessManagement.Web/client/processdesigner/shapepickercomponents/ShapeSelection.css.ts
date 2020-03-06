import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { important } from 'csx';
import { ShapeSelectionStyles } from '../../fx/models/styles';

StyleFlow.define(ShapeSelectionStyles, {
    shapesWrapper: {
        display: 'inline-block'
    },
    shapeDefinitionItem: (size: number) => {
        return {
            padding: '2px',
            margin: '10px',
            width: size + 'px',
            height: size + 'px'
        }
    },
    canvasWrapper: (theme: OmniaTheming) => {
        return {
            cursor: 'pointer',
            $nest: {
                '&.selected': {
                    boxShadow: "inset 2px 2px 0px 0px " + theme.promoted.body.primary.base + "," + "inset -2px -2px 0px 0px " + theme.promoted.body.primary.base
                }
            }
        }
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    wrapper: {
        overflow: 'auto',
        width: '100%',
        height: '100%'
    },
    dialogFooter: {
        textAlign: "right" as any,
        height: "52px",
        padding: '8px',
        boxShadow: '0 -5px 5px -5px rgba(0, 0, 0, 0.26)'
    },
    centerDialogBody: {
        maxHeight: `calc(${window.innerHeight}px - 220px)`,
        overflowY: "auto",
        $nest: {
            '.v-input__control': {
                flexGrow: "1 !important" as any
            }
        }
    }
});