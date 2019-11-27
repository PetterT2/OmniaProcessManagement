import { StyleFlow } from "@omnia/fx/ux";
import { ProcessLibraryListViewStyles } from '../../../models';
import { important } from 'csx';

StyleFlow.define(ProcessLibraryListViewStyles,
    {
        menuColumn: {
            textAlign: "center",
            width: "100px",
            minWidth: "100px",
            $nest: {
                '.v-btn': {
                    margin: '0 !important'
                }
            }
        },
        menuHeader: {
            cursor: important('pointer'),
        },
        wrapper: {
            position: 'relative',
            margin: '0 20px 40px 20px'
        },
        mainTab: {
            $nest: {
                '.v-slide-group__wrapper': {
                    paddingLeft: '20px',
                    background: '#f4f4f4',
                },
                '.v-datatable > thead >tr': {
                    borderTop: '1px solid rgba(0,0,0,.12)'
                },
                '.v-datatable > tbody >tr:last-child': {
                    borderBottom: '1px solid rgba(0,0,0,.12)'
                }
            }
        }
    }
)