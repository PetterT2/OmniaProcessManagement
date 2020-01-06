import { StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupBlockListViewSettingsStyles } from '../../../../models';


StyleFlow.define(ProcessRollupBlockListViewSettingsStyles,
    {
        columnWrapper: {
            display: 'flex',
            position: 'relative'
        },
        orderAction: {
            float: 'right'
        },
        widthInput: {
            flex: '0 0 60px !important'
        },
        showHeadingCheckbox: {
            flex: '0 0 !important',
            marginLeft: '5px',
            marginTop: '0px !important',
            height: '35px'
        }
    }
);
