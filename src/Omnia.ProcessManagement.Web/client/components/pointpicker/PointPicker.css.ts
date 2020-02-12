import { style, cssRaw } from "typestyle";
import colors from 'vuetify/es5/util/colors';

/**
 * Styles for the component
 */
export const PointPickerStyles = {
    container: style({
        position: 'relative',
        height: '130px',
        width: '130px'
    }),
    iconColor: colors.grey.base,
    center: style({
        position: 'absolute',
        left: 45,
        top: 45,
        transform: 'rotate(45deg)'
    }),
    leftUpArrow: style({
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'rotate(-45deg)'
    }),
    upArrow: style({
        position: 'absolute',
        top: 0,
        left: 45
    }),
    rightUpArrow: style({
        position: 'absolute',
        top: 0,
        left: 90,
        transform: 'rotate(45deg)'
    }),
    leftArrow: style({
        position: 'absolute',
        left: 0,
        top: 45
    }),
    rightArrow: style({
        position: 'absolute',
        left: 90,
        top: 45
    }),
    leftDownArrow: style({
        position: 'absolute',
        top: 90,
        left: 0,
        transform: 'rotate(45deg)'
    }),
    downArrow: style({
        position: 'absolute',
        left: 45,
        top: 90
    }),
    rightDownArrow: style({
        position: 'absolute',
        top: 90,
        left: 90,
        transform: 'rotate(-45deg)'
    }),
}

cssRaw(`
opm-point-picker{
    display: inline-block !important;
}
`)