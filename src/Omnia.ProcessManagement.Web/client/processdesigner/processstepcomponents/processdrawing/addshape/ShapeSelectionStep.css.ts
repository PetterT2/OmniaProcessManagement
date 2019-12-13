import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { ShapeSelectionStepStyles } from '../../../../fx/models/styles';
import { important } from 'csx';

StyleFlow.define(ShapeSelectionStepStyles, {
    shapesWrapper: {
        display: 'flex',
        alignItems: 'center'
    },
    shapeDefinitionItem: (theme: OmniaTheming) => {
        return {
            cursor: 'pointer',
            padding: '10px',
            $nest: {
                '&.selected': {
                    boxShadow: "inset 2px 2px 0px 0px " + theme.promoted.body.primary.base + "," + "inset -2px -2px 0px 0px " + theme.promoted.body.primary.base
                }
            }
        }
    }
});