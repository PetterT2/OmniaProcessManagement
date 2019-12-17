import { StyleFlow } from '@omnia/fx/ux';
import { PermissionDialogStyles } from '../../models';

StyleFlow.define(PermissionDialogStyles,
    {
        dialogContent: {
            "-webkit-overflow-scrolling": "touch" as any,
            overflowY: "auto" as any,
            position: "relative" as any,
            height: `calc(${window.innerHeight}px - 132px)`
        },
        dialogFooter: {
            textAlign: "right" as any,
            height: "52px",
            padding: '8px',
            boxShadow: '0 -5px 5px -5px rgba(0, 0, 0, 0.26)'
        },
        label: {
            fontSize: '20px'
        },
        link: {
            textDecoration: 'underline',
            cursor: 'pointer'
        }
    });
