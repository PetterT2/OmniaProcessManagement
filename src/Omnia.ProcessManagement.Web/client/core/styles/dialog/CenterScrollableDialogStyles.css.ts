import { StyleFlow } from "@omnia/fx/ux";
import { CenterScrollableDialogStyles } from '../../../fx/models';
import { important } from 'csx';

StyleFlow.define(CenterScrollableDialogStyles, {
    dialogContentClass:
    {
        display: important('flex')
    },
    dialogInnerWrapper: {
        display: important('flex'),
        flex: '1 1 100%',
        flexDirection: 'column',
        maxHeight: '100%',
        maxWidth: '100%'
    },
    dialogTitle: {
        flex: '0 0 auto'
    },
    dialogMainContent: {
        backfaceVisibility: 'hidden',
        flex: '1 1 auto',
        overflowY: 'auto'
    },
    dialogActions: {
        flex: '0 0 auto'
    }
});