import { StyleFlow } from '@omnia/fx/ux';
import { ProcessTemplateShapeSettingsBladeStyles } from '../../../../../models';
import { important } from 'csx';

StyleFlow.define(ProcessTemplateShapeSettingsBladeStyles,
    {
        flexDisplay: {
            display: "flex"
        },
        contentPadding: {
            paddingLeft: "15px"
        },
        shapePreviewContainer: {
            height: "230px"
        },
        hidePreviewContainer: {
            display: "none"
        },
        shapeSettingsContainer: {
            paddingTop: "5px"
        }
    });