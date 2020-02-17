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
        canvas: {
            position: 'unset !important' as any
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