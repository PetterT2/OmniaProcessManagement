import { style } from 'typestyle';
import { important } from 'csx';
import { StyleFlow } from '@omnia/fx/ux';
import { GlobalProcessRendererStyles } from '../../models';

declare var Zepto: any;

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
            let omniaHeaderHeight = Zepto('#omnia-header').height() || 0;
            return {
                position: 'absolute' as any,
                top: `${omniaHeaderHeight + 50}px`, 
                bottom: 0,
                left: 0,
                right: 0,
                background: '#e7e7e7',
                overflow: 'auto',
                height: `calc(${window.innerHeight}px - ${omniaHeaderHeight + 50}px)`,
                zIndex: 1
            }
        },
        containerInSpfxIFrame: () => {
            return {
                position: 'absolute' as any,
                top: 0, 
                bottom: 0,
                left: 0,
                right: 0,
                background: '#e7e7e7',
                overflow: 'auto',
                height: `${window.innerHeight}px`,
                zIndex: 1
            }
        },
        background: {
            background: 'white'
        }
    })
