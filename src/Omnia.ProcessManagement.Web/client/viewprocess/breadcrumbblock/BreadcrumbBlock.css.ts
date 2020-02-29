
import { important } from 'csx';
import { SpacingSettings } from '@omnia/fx-models';
import { StyleFlow } from '@omnia/fx/ux';
import { BreadcrumbBlockStyles } from '../../models';


StyleFlow.define(BreadcrumbBlockStyles, {
    padding: (spacing: SpacingSettings) => {
        let paddingLeft = spacing && (spacing.left || 0)
        let paddingRight = spacing && (spacing.right || 0)
        let paddingTop = spacing && (spacing.top || 0)
        let paddingBottom = spacing && (spacing.bottom || 0)

        return {
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
        }
    },
    layout: {
        backgroundColor: important("transparent")
    },
    breadcrumbLink: {
        textDecoration: 'none',
        cursor: 'pointer'
    }
});