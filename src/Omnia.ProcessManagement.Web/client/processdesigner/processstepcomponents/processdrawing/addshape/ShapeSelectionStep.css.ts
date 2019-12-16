import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { ShapeSelectionStepStyles } from '../../../../fx/models/styles';
import { important } from 'csx';

StyleFlow.define(ShapeSelectionStepStyles, {
    shapesWrapper: {
        display: 'flex',
        alignItems: 'center'
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
    }
});