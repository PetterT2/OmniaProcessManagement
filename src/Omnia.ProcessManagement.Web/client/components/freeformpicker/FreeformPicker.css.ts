﻿import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { important } from 'csx';
import { FreeformPickerStyles } from '../../fx/models/styles';

StyleFlow.define(FreeformPickerStyles, {
    wrapper: {
        overflow: 'auto',
        width: '100%',
        height: '100%'
    },
    dialogFooter: {
        textAlign: "right" as any,
        height: "52px",
        padding: '8px',
        boxShadow: '0 -5px 5px -5px rgba(0, 0, 0, 0.26)'
    },
    centerDialogBody: {
        maxHeight: `calc(${window.innerHeight}px - 220px)`,
        overflowY: "auto",
        $nest: {
            '.v-input__control': {
                flexGrow: "1 !important" as any
            }
        }
    }
});