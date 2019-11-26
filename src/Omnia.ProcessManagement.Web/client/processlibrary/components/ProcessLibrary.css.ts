import { StyleFlow } from "@omnia/fx/ux";
import { ProcessLibraryStyles } from '../../models';

StyleFlow.define(ProcessLibraryStyles,
    {
        dialogContent: {
            "-webkit-overflow-scrolling": "touch" as any,
            overflowY: "auto" as any,
            position: "relative" as any,
            height: `calc(${window.innerHeight}px - 118px)`
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
        },
        error: {
            color: 'red'
        }
    }
)