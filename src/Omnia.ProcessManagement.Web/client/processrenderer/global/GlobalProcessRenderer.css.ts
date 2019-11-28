import { style } from 'typestyle';
import { important } from 'csx';
import { StyleFlow } from '@omnia/fx/ux';
import { GlobalProcessRendererStyles } from '../../models';

StyleFlow.define(GlobalProcessRendererStyles,
    {
        container: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            zIndex: 5 //hide the wcm floading action button
        }
    })
