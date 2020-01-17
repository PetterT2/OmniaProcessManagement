import { style } from 'typestyle';
import { important } from 'csx';
import { StyleFlow } from '@omnia/fx/ux';
import { GlobalProcessRendererStyles } from '../../models';

StyleFlow.define(GlobalProcessRendererStyles,
    {
        containerInOmnia: () => {
            return {
                position: 'absolute' as any,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: '#e7e7e7',
                overflow: 'auto',
                height: `${window.innerHeight}px`,
                zIndex: 5 //hide the wcm floading action button
            }
        },
        containerInSpfx: () => {
            return {
                position: 'absolute' as any,
                top: '110px', //todo - update to calculated value
                bottom: 0,
                left: 0,
                right: 0,
                background: '#e7e7e7',
                overflow: 'auto',
                height: `calc(${window.innerHeight}px - 110)`,
                zIndex: 1
            }
        },
        containerInSpfxIFrame: () => {
            return {
                position: 'absolute' as any,
                top: '60px', //todo - update to calculated value
                bottom: 0,
                left: 0,
                right: 0,
                background: '#e7e7e7',
                overflow: 'auto',
                height: `calc(${window.innerHeight}px - 60)`,
                zIndex: 1
            }
        },
        background: {
            background: 'white'
        }
    })
