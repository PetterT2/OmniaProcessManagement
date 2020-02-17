import { StyleFlow } from '@omnia/fx/ux';
import { UnpublishProcessDialogStyles } from '../../fx/models';

StyleFlow.define(UnpublishProcessDialogStyles,
    {
        centerDialogBody: {
            maxHeight: `calc(${window.innerHeight}px - 220px)`,
            overflowY: "auto",
            $nest: {
                '.v-input__control': {
                    flexGrow: "1 !important" as any
                }
            }
        },
        dialogFooter: {
            textAlign: "right" as any,
            height: "60px",
            padding: '8px',
            boxShadow: '0 -5px 5px -5px rgba(0, 0, 0, 0.26)'
        },
    });
